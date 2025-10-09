
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Validation schema
const sendInvoiceEmailSchema = z.object({
  pdfDataUrl: z.string().min(1, "PDF data is required").max(15 * 1024 * 1024, "PDF data too large"),
  clientEmail: z.string().trim().email("Invalid email format").max(255, "Email must be less than 255 characters"),
  clientName: z.string().trim().max(200, "Client name must be less than 200 characters"),
  businessName: z.string().trim().min(1, "Business name is required").max(200, "Business name must be less than 200 characters"),
  invoiceNumber: z.string().trim().min(1, "Invoice number is required").max(100, "Invoice number must be less than 100 characters"),
  documentType: z.enum(['invoice', 'receipt']),
});

interface SendInvoiceEmailRequest {
  pdfDataUrl: string;
  clientEmail: string;
  clientName: string;
  businessName: string;
  invoiceNumber: string;
  documentType: 'invoice' | 'receipt';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Edge function started');
    
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY is not configured");
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service not configured. Please contact support.' 
        }),
        {
          status: 500,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    const resend = new Resend(resendApiKey);

    const body = await req.json();
    
    // Validate input data using zod schema
    const validationResult = sendInvoiceEmailSchema.safeParse(body);
    
    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }));
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: 'Invalid input data',
          details: errors
        }),
        {
          status: 400,
          headers: { 
            "Content-Type": "application/json", 
            ...corsHeaders 
          },
        }
      );
    }

    const { 
      pdfDataUrl, 
      clientEmail, 
      clientName, 
      businessName, 
      invoiceNumber, 
      documentType 
    } = validationResult.data;

    // Convert data URL to buffer for attachment with optimized processing
    let base64Data: string;
    
    console.log('Processing PDF data format...');
    if (pdfDataUrl.startsWith('data:application/pdf;base64,')) {
      base64Data = pdfDataUrl.split(',')[1];
    } else if (pdfDataUrl.startsWith('data:application/pdf;filename=')) {
      // Handle format like: data:application/pdf;filename=generated.pdf;base64,
      const parts = pdfDataUrl.split(',');
      if (parts.length >= 2) {
        base64Data = parts[1];
      } else {
        throw new Error('Invalid PDF data format - no base64 data found');
      }
    } else {
      // Assume it's already base64 data
      base64Data = pdfDataUrl;
    }

    if (!base64Data || base64Data.length === 0) {
      throw new Error('No PDF data found');
    }

    console.log('Converting PDF data to buffer...');
    
    // Use streaming approach for large files to prevent memory issues
    let pdfBuffer: Uint8Array;
    try {
      // Process in chunks to prevent memory overload
      const chunkSize = 1024 * 1024; // 1MB chunks
      const chunks: Uint8Array[] = [];
      
      for (let i = 0; i < base64Data.length; i += chunkSize) {
        const chunk = base64Data.slice(i, i + chunkSize);
        const binaryString = atob(chunk);
        const chunkArray = new Uint8Array(binaryString.length);
        
        for (let j = 0; j < binaryString.length; j++) {
          chunkArray[j] = binaryString.charCodeAt(j);
        }
        
        chunks.push(chunkArray);
      }
      
      // Combine all chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      pdfBuffer = new Uint8Array(totalLength);
      let offset = 0;
      
      for (const chunk of chunks) {
        pdfBuffer.set(chunk, offset);
        offset += chunk.length;
      }
      
      console.log(`PDF buffer created successfully: ${pdfBuffer.length} bytes`);
      
    } catch (conversionError) {
      console.error("Error converting PDF data:", conversionError);
      throw new Error(`Failed to process PDF data: ${conversionError.message}`);
    }

    const subject = `Your ${documentType === 'invoice' ? 'Invoice' : 'Receipt'} from ${businessName}`;
    const fileName = `${documentType}-${invoiceNumber}.pdf`;

    console.log('Preparing to send email with subject:', subject);

    const emailResponse = await resend.emails.send({
      from: "InvoiceMax <onboarding@resend.dev>",
      to: [clientEmail],
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Your ${documentType === 'invoice' ? 'Invoice' : 'Receipt'} from ${businessName}</h2>
          <p>Dear ${clientName || 'Valued Customer'},</p>
          <p>Please find your ${documentType} attached to this email.</p>
          <p><strong>${documentType === 'invoice' ? 'Invoice' : 'Receipt'} Number:</strong> ${invoiceNumber}</p>
          <p>Thank you for your business!</p>
          <br>
          <p>Best regards,<br>${businessName}</p>
          <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            This email was sent automatically from InvoiceMax. 
            If you have any questions, please contact ${businessName} directly.
          </p>
        </div>
      `,
      attachments: [
        {
          filename: fileName,
          content: pdfBuffer,
        },
      ],
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${documentType === 'invoice' ? 'Invoice' : 'Receipt'} sent successfully to ${clientEmail}`,
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invoice-email function:", error);
    
    let errorMessage = 'Failed to send email';
    let statusCode = 500;
    
    // Handle Resend-specific errors
    if (error.message?.includes('You can only send testing emails') || 
        error.message?.includes('verify a domain')) {
      errorMessage = 'Email service is in testing mode. Please use oyeniyios.iart@gmail.com as the recipient email, or contact the administrator to verify a domain for production use.';
      statusCode = 400;
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = 'Please enter a valid email address.';
      statusCode = 400;
    } else if (error.message?.includes('Missing required')) {
      errorMessage = 'Please fill in all required fields before sending.';
      statusCode = 400;
    } else if (error.message?.includes('API key')) {
      errorMessage = 'Email service configuration error. Please contact support.';
      statusCode = 500;
    } else if (error.message?.includes('too large')) {
      errorMessage = 'PDF file is too large for email. Please try generating a smaller PDF.';
      statusCode = 400;
    } else if (error.message?.includes('PDF data format') || error.message?.includes('Failed to process PDF')) {
      errorMessage = 'Invalid PDF format. Please try generating the PDF again.';
      statusCode = 400;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
      }),
      {
        status: statusCode,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
