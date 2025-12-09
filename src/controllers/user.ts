import { publishToQueue } from "../config/rabbitmq.js";
import TryCatch from "../config/TryCatch.js";
import { redisClient } from "../index.js";
import { User } from "../model/User.js";

export const loginUser = TryCatch(async (req, res) => {
    const { email } = req.body
    const rateLimitKey = `otp:ratelimit:${email}`
    const rateLimit = await redisClient.get(rateLimitKey)
    if (rateLimit) {
        res.status(429).json({ message: "Too many requests. Please wait before requesting new otp" })
        return
    }
    const otp = Math.floor(Math.random() * 900000 + 100000).toString()
    const otpKey = `otp:${email}`
    await redisClient.set(otpKey, otp,
        { EX: 30000 }
    )
    await redisClient.set(rateLimitKey, "true", { EX: 60 })
    const message = {
        to: email,
        subject: "OTP for login",
        body: `Your OTP is ${otp}. valid for 5 min`
    }
    await publishToQueue("send-otp", message)
    res.status(200).json({ message: "OTP sent to your mail" })
})

export const verifyUser = TryCatch(async (req, res) => {
    const { email, otp: enteredOtp } = req.body
    if (!email || !enteredOtp) {
        res.status(400).json({ message: "Email and otp required" })
        return
    }

    const optKey = `otp:${email}`
    const storedOtp = await redisClient.get(optKey)
    if (!storedOtp || storedOtp !== enteredOtp) {
        res.status(400).json({ message: "Invalid otp" })
        return
    }
    await redisClient.del(optKey)
    let user = await User.findOne({ email })
    if (!user) {
        const name = email.slice(0, 8)
        user = await User.create({ name, email })
    }
    // const storedOtp = await redisClient.get(optKey)
    // if(!storedOtp){
    //     res.status(400).json({message:"Invalid otp"})
    //     return
    // }
    // if(storedOtp !== enteredOtp){
    //     res.status(400).json({message:"Invalid otp"})
    //     return
    // }



})