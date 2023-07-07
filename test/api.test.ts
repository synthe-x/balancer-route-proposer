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
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2d&sender=xyz&recipient=abc&deadline=12345&kind=0&slipage=0.05&amount=0.001`)
       
        // console.log(res.body)
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })
    it('it sould check getPath api by exact token Out', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2d&sender=xyz&recipient=abc&deadline=12345&kind=1&slipage=0.05&amount=1`)
        // console.log(res.body)
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })

    it('it sould fail as not valid kind ', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2d&sender=xyz&recipient=abc&deadline=12345&kind=2&slipage=0.05&amount=1`)
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.KIND_NOT_VALID);
    })

    it('it sould fail as not token is not valid', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2e&sender=xyz&recipient=abc&deadline=12345&kind=0&slipage=0.05&amount=1`)
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.PAIR_NOT_AVAILABLE);
    })

    it('it sould fail as amount not valid', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2d&sender=xyz&recipient=abc&deadline=12345&kind=0&slipage=0.05&amount=-1`)
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.AMOUNT_NOT_VALID);
    })

    it('it sould fail as sender in missing', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2d&recipient=abc&deadline=12345&kind=0&slipage=0.05&amount=1`)
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.PROPERTY_MISSING_IN_REQ_QUERY);
    })


})

