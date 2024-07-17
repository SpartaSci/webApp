BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "models" (
	"model_id"	INTEGER,
	"power"	INTEGER,
	"cost"	INTEGER,
	"maxAcc" INTEGER,
	PRIMARY KEY("model_id" AUTOINCREMENT) 
);
INSERT INTO "models" ("power","cost","maxAcc") VALUES (50,10000,4);
INSERT INTO "models" ("power","cost","maxAcc") VALUES (100,12000,5);
INSERT INTO "models" ("power","cost","maxAcc") VALUES (150,14000,7);

COMMIT;

BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "accessories" (
	"accessory_id" INTEGER,
	"name" TEXT NOT NULL UNIQUE,
	"price"	INTEGER NOT NULL, 
	"quantity" INTEGER NOT NULL,
	PRIMARY KEY("accessory_id" AUTOINCREMENT)
);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('radio', 300, 55);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('bluetooth', 200, 34);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('satellite navigator', 600, 16);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('power windows', 200, 30);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('extra front light', 150, 30);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('extra red light', 150, 30);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('air conditioning', 600, 1);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('spare tire', 200, 15);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('assisted driving', 1200, 2);
INSERT INTO "accessories" ("name","price","quantity") VALUES ('automatic braking', 800, 2);


CREATE TABLE IF NOT EXISTS "incompatibleAccessories" (
    "id_1" INTEGER,
    "id_2" INTEGER,
    PRIMARY KEY("id_1","id_2"),
    FOREIGN KEY("id_1") REFERENCES "accessories"("accessory_id"),
    FOREIGN KEY("id_2") REFERENCES "accessories"("accessory_id")
);

INSERT INTO "incompatibleAccessories" ("id_1","id_2") VALUES (7,8);
INSERT INTO "incompatibleAccessories" ("id_1","id_2") VALUES (9,10);


CREATE TABLE IF NOT EXISTS "accNeedAcc" (
    "current_id" INTEGER,
    "needed_id" INTEGER,
    PRIMARY KEY("current_id","needed_id"),
    FOREIGN KEY("current_id") REFERENCES "accessories"("accessory_id"),
    FOREIGN KEY("needed_id") REFERENCES "accessories"("accessory_id")
);
INSERT INTO "accNeedAcc" ("current_id","needed_id") VALUES (2,1);
INSERT INTO "accNeedAcc" ("current_id","needed_id") VALUES (3,2);
INSERT INTO "accNeedAcc" ("current_id","needed_id") VALUES (6,5);
INSERT INTO "accNeedAcc" ("current_id","needed_id") VALUES (7,4);
COMMIT;





BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "user_id"	INTEGER,
    "name"	TEXT NOT NULL,
    "email"	TEXT NOT NULL UNIQUE,
    "good" INTEGER DEFAULT 0,
	"hash"	TEXT NOT NULL,
	"salt"	TEXT NOT NULL,
    PRIMARY KEY("user_id" AUTOINCREMENT)
);
INSERT INTO "users" ("name","email","good","hash","salt") VALUES ('Pluto', 'a@gmail.com',1,'15d3c4fca80fa608dcedeb65ac10eff78d20c88800d016369a3d2963742ea288','72e4eeb14def3b21');
INSERT INTO "users" ("name","email","good","hash","salt") VALUES ('Luigi', 'b@gmail.com',0,'1d22239e62539d26ccdb1d114c0f27d8870f70d622f35de0ae2ad651840ee58a','a8b618c717683608');
INSERT INTO "users" ("name","email","good","hash","salt") VALUES ('Mario', 'c@gmail.com',1,'61ed132df8733b14ae5210457df8f95b987a7d4b8cdf3daf2b5541679e7a0622','e818f0647b4e1fe0');
INSERT INTO "users" ("name","email","good","hash","salt") VALUES ('Lucca', 'd@gmail.com',0,'ac7f6a831c2277a38c56155d33dfff2a4c7a1fdd9a34c744865695a3a5407215','72e4eeb14def3b20');
INSERT INTO "users" ("name","email","good","hash","salt") VALUES ('Simon', 'e@gmail.com',0,'30043fca14064dbf5bdca1564f558d91ab220fdc5820de191f588ef54456b087','a818f0657b4e1fe1');
COMMIT;


BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "configurations" (
    "user_id" INTEGER,
    "model_id" INTEGER,
    PRIMARY KEY("user_id"),
    FOREIGN KEY("user_id") REFERENCES "users"("id"),
    FOREIGN KEY("model_id") REFERENCES "models"("id")
);

INSERT INTO "configurations" ("user_id","model_id") VALUES (1,3);
INSERT INTO "configurations" ("user_id","model_id") VALUES (2,2);
INSERT INTO "configurations" ("user_id","model_id") VALUES (3,1);


CREATE TABLE IF NOT EXISTS "accPerConf" (
    "user_id" INTEGER,
    "accessory_id" INTEGER,
    PRIMARY KEY("user_id","accessory_id")
    FOREIGN KEY("user_id") REFERENCES "configurations"("user_id"),
    FOREIGN KEY("accessory_id") REFERENCES "accessories"("accessory_id")
);

INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,10);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,5);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,6);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,1);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,2);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,4);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (1,7);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (2,1);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (2,2);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (2,3);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (2,4);
INSERT INTO "accPerConf" ("user_id","accessory_id") VALUES (2,7);

COMMIT;


