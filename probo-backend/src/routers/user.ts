import { Router } from "express";
const router =Router()

router.post('/signup', (req, res) => {
    //add sign verfication here
    console.log(req.body);
    res.send('ok')
})
export default router