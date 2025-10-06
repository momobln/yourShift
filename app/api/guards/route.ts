//ينشئ API endpoint /api/guards يعيد كل الحراس
import { NextResponse } from "next/server";    //لإرجاع الردود في Next.js.
import { PrismaClient } from "@prisma/client";  // للاتصال بقاعدة البيانات (PostgreSQL

 const prisma = new PrismaClient(); //إنشاء كائن prisma للتعامل مع قاعدة البيانات.
//يمكنك من خلاله تنفيذ أوامر مثل: findMany, create, update, delete.
//GET all Guards
 export async function GET(){
  const guards = await prisma.guard.findMany();
  return NextResponse.json(guards);
 }
 /*findMany() تجلب كل السجلات من جدول Guard.
ثم تُرجعها كـ JSON.*/

//POST create New Guard
export async function POST(req: Request){
    const data = await req.json();
    const guard = await prisma.guard.create({ data });
    return NextResponse.json(guard);
}


//DELETE a guard by ID تستقبل id للحارس
export async function DELETE(req: Request){
    const { id } = await req.json();        //نقرأ الـ id المرسل من الواجهة.
    await prisma.guard.delete({ where: { id }});     //يحذف الحارس من قاعدة البيانات
    return NextResponse.json({ message: "Guard deleted successfully"});
}

//UPDATE guard by ID
export async function PUT(req: Request){
    const data = await req.json();
    const updated = await prisma.guard.update({
        where: { id: data.id },
        data: {
            name: data.name,
            email: data.email,
            phone: data.phone,
        }
    });
    return NextResponse.json(updated);
}