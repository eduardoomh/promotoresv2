import { connectMongoDB } from '@/libs/mongodb'
import User, { IUserSchema } from '@/models/User'
import { validateEmail } from '@/utils/isValidEmail'
import { messages } from '@/utils/messages'
import { NextRequest, NextResponse } from 'next/server'
import bcryptjs from 'bcryptjs'

export async function GET(req: NextRequest) {
    try {
        await connectMongoDB()
        const { searchParams } = new URL(req.url)
        const filtered_role = searchParams.get('role')
        let users: any
        if(filtered_role !== null){
            users = await User.aggregate([
                {
                  $match: { role: filtered_role } // Filtra por rol especificado
                },
                {
                  $lookup: {
                    from: 'promoters', // Nombre de la colección 'promoter'
                    localField: '_id', // Campo local (de la colección 'User')
                    foreignField: 'user', // Campo en la colección 'promoter' que se relaciona con '_id'
                    as: 'promoters' // Alias para los resultados de la consulta
                  }
                },
                {
                  $match: {
                    'promoters': { $size: 0 } // Filtra los usuarios sin promotores relacionados
                  }
                }
              ]);
            
        }else{
            users = await User.find().sort({ $natural: -1 })
        }
        
        const response = NextResponse.json({
            users,
            messages: messages.success.userCreated
        }, {
            status: 200
        })

        return response

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: messages.error.default, error
        }, {
            status: 500
        })
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB()
        const body = await req.json()
        const { name, email, password, confirm_password, role } = body

        //validar campos enviados
        if (!email || !password || !confirm_password) {
            return NextResponse.json({
                message: messages.error.needProps
            }, {
                status: 400
            })
        }
        if (!validateEmail(email)) {
            return NextResponse.json({
                message: messages.error.emailNotValid
            }, {
                status: 400
            })
        }

        if (password !== confirm_password) {
            return NextResponse.json({
                message: messages.error.passwordNotMatch
            }, {
                status: 400
            })
        }

        const userFind = await User.findOne({ email })

        if (userFind) {
            return NextResponse.json({
                message: messages.error.emailExist
            }, {
                status: 400
            })
        }

        const hashedPassword = await bcryptjs.hash(password, 10)

        const newUser: IUserSchema = new User({
            name,
            email,
            role,
            password: hashedPassword
        })

        //@ts-ignore
        const { password: passw, ...rest } = newUser._doc

        await newUser.save()
        const response = NextResponse.json({
            newUser: rest,
            message: messages.success.userCreated
        }, {
            status: 200
        })

        return response

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: messages.error.default, error
        }, {
            status: 500
        })
    }
}
