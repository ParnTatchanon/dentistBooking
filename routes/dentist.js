const express = require('express');
const {getHospital, getHospitals, createHospitals, updateHospital,deleteHospital,getVacCenters} = require('../controllers/hospitals');
const router = express.Router();
const {protect,authorize} = require ('../middleware/auth');
router.route('/vacCenters').get(getVacCenters);

//Include other resource routers
const appointmentRouter=require('./appointments');

//Re-route into other resource routers
router.use('/:hospitalId/appointments/',appointmentRouter);

router.route('/').get(getHospitals).post(protect,authorize('admin'),createHospitals);
router.route('/:id').get(getHospital).put(protect,authorize('admin'),updateHospital).delete(protect,authorize('admin'),deleteHospital);


module.exports=router;