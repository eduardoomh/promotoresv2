import { connectMongoDB } from '@/libs/mongodb'
import Promoter, { IPromoterSchema } from '@/models/Promoter'
import User from '@/models/User'
import { messages } from '@/utils/messages'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
    try {
        await connectMongoDB()
        const body = await req.json()
        const {new_promoter} = body
        const {user, personal_info, address} = new_promoter

        //validar campos enviados
        if(
            !user || !personal_info || !address
            ){
            return NextResponse.json({
                message: messages.error.needProps
            },{
                status: 400
            })
        }

        const userFind = await User.findOne({_id: user})
        const promoterFind = await Promoter.findOne({user})

        if(!userFind){
            return NextResponse.json({
                message: messages.error.default
            },{
                status: 400
            })
        }

        if(promoterFind){
            return NextResponse.json({
                message: messages.error.default
            },{
                status: 400
            })
        }

        const newPromoter: IPromoterSchema = new Promoter({
            user,
            personal_info: {
                name: personal_info.name,
                last_name: personal_info.last_name,
                phone: personal_info.phone,
                mobile_phone: personal_info.mobile_phone,
                rfc: personal_info.rfc,
            },
            address:{
                street: address.street,
                postal_code: address.postal_code,
                district: address.district,
                state: address.state,
                country: address.country,
            },
            balance: 0,
            type: 'active'
        })

        //@ts-ignore
        const promoterCreated = newPromoter._doc

        await newPromoter.save()

        const response =  NextResponse.json({
            promoter: promoterCreated,
            messages: messages.success.userCreated
        },{
            status: 200
        })

        return response

    } catch (error) {
        console.log(error)
        return NextResponse.json({
            message: messages.error.default, error
        },{
            status: 500
        })
    }
}

export async function GET(){
    try{
        await connectMongoDB()
        const promoters = await Promoter.find().populate('user')

        const response =  NextResponse.json({
            promoters,
            messages: messages.success.userCreated
        },{
            status: 200
        })
        return response
    }catch(error){
        console.log(error)
        return NextResponse.json({
            message: messages.error.default, error
        },{
            status: 500
        })
    }
}