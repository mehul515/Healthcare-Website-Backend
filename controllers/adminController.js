import jwt from "jsonwebtoken"

// API for admin login
const loginAdmin = async (req, res) => {
    try {
        
        const {email, password} = req.body;
        if(email==process.env.ADMIN_EMAIL && password==process.env.ADMIN_PASSWORD){
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            return res.json({success:true, token});
        }else{
            return res.json({success:false, message:"Invalid Credentials"})
        }

    } catch (error) {
        (error)
        res.json({success:false, message:error.message})
    }
}

export {loginAdmin}