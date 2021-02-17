const { Sequelize, STRING, DataTypes, UUID, UUIDV4, INTEGER, DATE } = require('sequelize');
const db = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/acme_country_club');
const express = require('express');
const path = require('path');
const app = express();

const Facilities = db.define ("facilities", {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    fac_name: {
        type: STRING(100),
        unique: true,
        allowNull: false
    }
});

const Members = db.define ("members", {
    id: {
        type: UUID,
        primaryKey: true,
        defaultValue: UUIDV4,
    },
    first_name: {
        type: STRING(20),
        unique: true,
        allowNull: false
    }
});

const Bookings = db.define ("bookings", {
   startTime: {
        type: DATE,
        unique: true,
        allowNull: false,
    },
    endTime: {
        type: DATE,
        unique: true,
        allowNull: false,
    }
});

const Member_Bookings = db.define ("member_bookings", {
    
 });

Bookings.belongsTo(Facilities);
Bookings.belongsTo(Members, { as: 'bookedBy'});
Members.belongsTo(Members, {as: 'sponsor'});
Member_Bookings.belongsTo(Members);
Member_Bookings.belongsTo(Bookings);

const syncAndSeed = async() =>{
    await db.sync({force: true});
    const [pool, gym, sauna, Mike, Nick, Akinde] = await Promise.all([
        Facilities.create({fac_name: 'pool'}), 
        Facilities.create({fac_name: 'gym'}), 
        Facilities.create({fac_name: 'sauna'}), 
        Members.create({first_name: 'Mike'}), 
        Members.create({first_name: 'Nick'}),
        Members.create({first_name: 'Akinde'}),
    ]);

    const [booking1, booking2] = await Promise.all([
        Bookings.create({startTime: '1/21/2021 3:00 PM', endTime: '1/21/2021 4:00 PM'}),
        Bookings.create({startTime: '1/22/2021 12:00 PM', endTime: '1/22/2021 1:00 PM'}),
    ]);
    booking1.facilityId = gym.id;
    booking2.facilityId = sauna.id;
    booking1.bookedById = Akinde.id;
    booking2.bookedById = Mike.id;
    Mike.sponsorId = Nick.id;
    Akinde.sponsorId = Nick.id;
    booking1.save();
    booking2.save();
    Mike.save();
    Akinde.save();
    //booking1.save();
};

const init = async() =>{
    try {
        await db.authenticate();
        await syncAndSeed();
        const port = process.env.PORT || 3000;

        app.listen(port, ()=>console.log(`listening on port ${port}`));
    }
    catch(ex){
        console.log(ex);
    }
}

init();

app.get("/", async (req, res, next) => {
    try {
        res.redirect("/api/facilities");
    }
    catch(ex)
    {
        next(ex);
    }
  });

  app.get("/api/facilities", async (req, res, next) => {
    try {
        const facs = await Facilities.findAll()
        res.send(facs);
    }
    catch(ex)
    {
        next(ex);
    }
  });

  app.get("/api/bookings", async (req, res, next) => {
    try {
        const bookings = await Bookings.findAll({
            include: [
                {
                    model: Members,
                    as: 'bookedBy',
                },
            ],
        });
        res.send(bookings);
    }
    catch(ex)
    {
        next(ex);
    }
  });
/*
  app.get("/api/members", async (req, res, next) => {
    try {
        const members = await Members.findAll({
            include: [
                {
                    model: Members,
                    as: 'sponsor',
                },
            ],
        });
        res.send(members);
    }
    catch(ex)
    {
        next(ex);
    }
  });

  app.get("/api/member_bookings", async (req, res, next) => {
    try {
        const memBooks = await Member_Bookings.findAll({
            include: [Members,Bookings],
        });
        res.send(memBooks);
    }
    catch(ex)
    {
        next(ex);
    }
  }); */