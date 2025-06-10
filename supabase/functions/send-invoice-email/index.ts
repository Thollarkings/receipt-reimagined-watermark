
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { 
      pdfDataUrl, 
      clientEmail, 
      clientName, 
      businessName, 
      invoiceNumber, 
      documentType 
    }: SendInvoiceEmailRequest = await req.json();

    console.log('Sending email to:', clientEmail);
    console.log('Document type:', documentType);
    console.log('Invoice number:', invoiceNumber);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientEmail)) {
      throw new Error('Invalid email address format');
    }

    // Validate required fields
    if (!pdfDataUrl || !clientEmail || !businessName || !invoiceNumber) {
      throw new Error('Missing required fields');
    }

    // Convert data URL to buffer for attachment
    if (!pdfDataUrl.startsWith('data:application/pdf;base64,')) {
      throw new Error('Invalid PDF data format');
    }

    const base64Data = pdfDataUrl.split(',')[1];
    if (!base64Data) {
      throw new Error('No PDF data found');
    }

    const pdfBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));

    const subject = `Your ${documentType === 'invoice' ? 'Invoice' : 'Receipt'} from ${businessName}`;
    const fileName = `${documentType}-${invoiceNumber}.pdf`;

    console.log('Attempting to send email with subject:', subject);

    // Add timeout to the email sending
    const emailPromise = resend.emails.send({
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

    // Add timeout (30 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Email sending timeout')), 30000);
    });

    const emailResponse = await Promise.race([emailPromise, timeoutPromise]);

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
    
    if (error.message?.includes('timeout')) {
      errorMessage = 'Email sending timed out. Please try again.';
    } else if (error.message?.includes('API key')) {
      errorMessage = 'Email service configuration error. Please contact support.';
    } else if (error.message?.includes('Invalid email')) {
      errorMessage = 'Please enter a valid email address.';
    } else if (error.message?.includes('Missing required')) {
      errorMessage = 'Please fill in all required fields before sending.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: errorMessage 
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
};

serve(handler);
