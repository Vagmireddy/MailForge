import nodemailer from 'nodemailer'; import { config } from './config';
const transport=nodemailer.createTransport({host:config.ethereal.host,port:config.ethereal.port,secure:false,auth:{user:config.ethereal.user,pass:config.ethereal.pass}});
export async function sendMail(email:{sender:string;recipient:string;subject:string;body:string}){const info=await transport.sendMail({from:email.sender,to:email.recipient,subject:email.subject,text:email.body});return {preview:nodemailer.getTestMessageUrl(info)||null};}
