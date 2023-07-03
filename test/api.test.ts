import { expect, use, } from "chai";
import app from "../src/index"
import chaiHttp from "chai-http";
import chai from "chai";
import { ERROR } from "../src/utils/error";
import { _fetchPoolData, fetchPoolData } from "../src/sor/subGraphData/graphquery";

use(chaiHttp);
let server: any;
describe(`Testing Api`, () => {

    before(async() => {
        await _fetchPoolData()
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
            "tokenIn":"0x43d9c2dec2a83079641feafdabc4719bb362aacf",
            "tokenOut": "0xe49b5e1a76a9a081ca6be9ac31df63afc1814e2e",
            "amount": 0.001,
            "kind": 0,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        // console.log(res.body)
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })
    it('it sould check getPath api by exact token Out', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x43d9c2dec2a83079641feafdabc4719bb362aacf",
            "tokenOut": "0xe49b5e1a76a9a081ca6be9ac31df63afc1814e2e",
            "amount": 1,
            "kind": 1,
            "sender":"xyz",
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        // console.log(res.body)
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })

    it('it sould fail as not valid kind ', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath`)
        .send({
            "tokenIn":"0x43d9c2dec2a83079641feafdabc4719bb362aacf",
            "tokenOut": "0xe49b5e1a76a9a081ca6be9ac31df63afc1814e2e",
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
            "tokenIn":"0x43d9c2dec2a83079641feafdabc4719bb362aacg",
            "tokenOut": "0xe49b5e1a76a9a081ca6be9ac31df63afc1814e2e",
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
            "tokenIn":"0x43d9c2dec2a83079641feafdabc4719bb362aacf",
            "tokenOut": "0xe49b5e1a76a9a081ca6be9ac31df63afc1814e2e",
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
            "tokenIn":"0x43d9c2dec2a83079641feafdabc4719bb362aacf",
            "tokenOut": "0xe49b5e1a76a9a081ca6be9ac31df63afc1814e2e",
            "amount": -1,
            "kind": 0,
            "recipient": "abc",
            "deadline": 12345,
            "slipage": 0.05
        
        });
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.PROPERTY_MISSING_IN_REQ_QUERY);
    })


})

