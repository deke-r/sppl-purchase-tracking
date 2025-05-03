const jwt=require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY




const authenticate=(req,res,next)=>{
    const token=req.headers['authorization']?.split(' ')[1]
    if (!token) {
        return res.status(403).json({ message: 'No token provided, access denied.' });
      }

      jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        req.user = decoded;
        next();
    })

    
}


module.exports=authenticate