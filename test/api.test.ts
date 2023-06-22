import { expect, use, } from "chai";
import app from "../src/index"
import chaiHttp from "chai-http";
import chai from "chai";
import { ERROR } from "../src/utils/error";

use(chaiHttp);
let server: any;
describe(`Testing Api`, () => {

    before(() => {
        server = app.listen(2000, () => {
            console.log(`Test Server Running On : ${2000}`);
        });
    })

    after((done)=>{
        server.close();
        done()
    })

    it('it should check default route', async () => {

        let res = await chai.request(server)
        .get(`/`)
        .send({});
        expect(res.status).to.be.equal(200);
        expect(res.text).to.be.equal("Welcome to SOR");
    });

    it('it sould check getPath api by exact token In', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x4ba519a744dc106a75308071f5b30d1f10425981",
            "tokenOut": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
            "amount": 1,
            "kind": 0,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })
    it('it sould check getPath api by exact token Out', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x4ba519a744dc106a75308071f5b30d1f10425981",
            "tokenOut": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
            "amount": 1,
            "kind": 1,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })

    it('it sould fail as not valid kind ', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x4ba519a744dc106a75308071f5b30d1f10425981",
            "tokenOut": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
            "amount": 1,
            "kind": 2,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.KIND_NOT_VALID);
    })

    it('it sould fail as not token is not valid', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x4ba519a744dc106a75308071f5b30d1f10425982",
            "tokenOut": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
            "amount": 1,
            "kind": 0,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.TOKEN_NOT_FOUND);
    })

    it('it sould fail as amount not valid', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x4ba519a744dc106a75308071f5b30d1f10425981",
            "tokenOut": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
            "amount": -1,
            "kind": 0,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.AMOUNT_NOT_VALID);
    })

    it('it sould fail as sender in missing', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x4ba519a744dc106a75308071f5b30d1f10425981",
            "tokenOut": "0x1b88abb8bd559aecf682aec5f554967d5394583f",
            "amount": -1,
            "kind": 0,
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.PROPERTY_MISSING_IN_REQ_BODY);
    })


})

