import { Client } from '@elastic/elasticsearch'; import { config } from './config';
export const elastic=new Client({node:config.elastic});
export async function indexEmail(email:any){try{await elastic.index({index:'emails',id:email.id,document:{recipient:email.recipient,sender:email.sender,subject:email.subject,status:email.status,scheduledAt:email.scheduledAt,sentAt:email.sentAt}})}catch{/* search availability must not stop delivery */}}
