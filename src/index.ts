
import express from 'express'
import cors from 'cors'
const app = express()
app.use(express.json());
app.use(cors())

import {PrismaClient} from '@prisma/client'
import {covertHours} from './utils/covert-hours'

const prisma = new PrismaClient({
    log: ['query']
})

app.get('/games',async(req,res)=>{
    const games = await prisma.game.findMany({
        include:{
          _count:{
            select:{
              ads:true  
            }
          }

        }
    })

    return res.status(200).json(games)
})
app.get('/games/:id/ads',async(req,res)=>{
    const gameId: any = req.params.id;
    const ads = await prisma.ads.findMany({
        select:{
            id:true,
            nome:true,
            weekDays:true,
            useVoiceChannel:true,
            yearsPlaying:true,
            hoursEnd:true,
            
            
            
        },
        orderBy:{
            createAt:'desc'
        },
        where:{
            gameId:gameId
        }
    });
    return res.json(ads.map(ad=>{
        return{
           ...ad,
           weekDays: ad.weekDays.split(",")
        }
    }))
    
})
app.get("/ads/:id/discord",async(req,res)=>{
    const adId = req.params.id;

    const ad = await prisma.ads.findUniqueOrThrow({
        select:{
            discord:true
        },
        where:{
            id: adId
        }
    })
    return res.json({
        discord: ad.discord,
    })
})
app.post('/games/:id/ads',async(req,res)=>{
    const gameId = req.params.id;
    const body:any = req.body

    const ad = await prisma.ads.create({
        data:{
            gameId,
            nome: body.nome,
            yearsPlaying:body.yearsPlaying,
            discord:body.discord,
            weekDays:body.weekDays.join(','),
            hoursStart: covertHours(body.hoursEnd),
            hoursEnd: covertHours (body.hoursEnd),
            useVoiceChannel: body.useVoiceChannel
        }
    })
    return res.status(201).json(ad)
})
app.listen(3333)