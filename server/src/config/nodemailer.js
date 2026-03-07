import nodemailer from 'nodemailer';

export const nodeMailerTransport = () => {
  try{
    const transporter = nodemailer.createTransport({
			service: "smtp.gmail.com",
			auth: {
				user: process.env.EMAIL_USER,
				pass: process.env.EMAIL_PASSWORD,
			},
		});
    return transporter;
  }
  catch(err){
    console.log(err)
  }
}