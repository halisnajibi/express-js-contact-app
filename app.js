const express = require('express')
const expressLayouts = require("express-ejs-layouts");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require('method-override')

//database
require("./database/db");
const Contact = require("./model/contact");

const app = express()
const port =3000

//setup ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
//setup method override
app.use(methodOverride('_method'))

app.get('/',async (req,res)=>{
    const contacts = await Contact.find()
    const contactCount = await Contact.countDocuments();
    res.render('index',{
        layout:'layouts/main',
        contacts,
        contactCount
    })
})

app.get('/contact',(req,res)=>{
    res.render('contact',{
        layout:'layouts/main'
    })
})

app.get("/contact/:id",async(req,res)=>{
    const contact =await Contact.findById(req.params.id)
    res.render("contact-edit", {
      layout: "layouts/main",
      contact
    });
  })

app.post(
    "/contact",
    [
      body("nama").custom(async (value) => {
        const duplikat = await Contact.findOne({ nama: value });
        if (duplikat) {
          throw new Error("contact sudah terdaftar");
        }
        return true;
      }),
      check("email", "email tidak valid").isEmail(),
      check("noHP", "noHP tidak valid").isMobilePhone("id-ID"),
    ],
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.render("contact", {
          layout: "layouts/main",
          errors: errors.array(),
        });
      } else {
        Contact.insertMany(req.body, (error, result) => {
            console.log(`berhasil`);
          //kirimkan flash
        //   req.flash("msg", "data berhasil ditambahkan");
          res.redirect("/");
        });
      }
    }
);


app.put("/contact",[
    body('nama').custom(async (value,{ req })=>{
      const duplikat =await Contact.findOne({nama:value})
      if(value !== req.body.namalama && duplikat){
        throw new Error('contact sudah terdaftar')
      }
      return true
    }),
    check('email','email tidak valid').isEmail(),
    check('noHP','nohp tidak valid').isMobilePhone('id-ID')
  ], (req,res) =>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      // return res.status(400).json({ errors: errors.array() });
      res.render('contact-edit',{
        layout:'layouts/main',
        errors:errors.array(),
        contact:req.body
      })
    }else{
      Contact.updateOne({_id:req.body.id},{
        $set:{
          nama:req.body.nama,
          email:req.body.email,
          noHP:req.body.noHP
        }
      }).then((result)=>{
        //kirimkan flash
        // req.flash('msg','data berhasil diupdate')
        console.log('berhasil');
        res.redirect('/')
      })
    }
  })

app.delete('/contact',(req,res)=>{
    Contact.deleteOne({_id:req.body.id}).then((result,error)=>{
     console.log(`berhasil`);
      res.redirect('/')
    })
})
  

app.listen(port,()=>{
    console.log(`running app port ${port}`);
})