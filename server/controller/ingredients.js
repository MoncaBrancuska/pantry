const express = require("express");
const router = express.Router();

const GetAbl = require("../abl/ingredients/getAbl");
const ListAbl = require("../abl/ingredients/listAbl");
const CreateAbl = require("../abl/ingredients/createAbl");
const UpdateAbl = require("../abl/ingredients/updateAbl");
const DeleteAbl = require("../abl/ingredients/deleteAbl");

router.get("/get", GetAbl);
router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;
