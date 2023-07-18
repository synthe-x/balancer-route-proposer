import { expect, use, } from "chai";
import app from "../src/index"
import chaiHttp from "chai-http";
import chai from "chai";
import { _fetchPoolData } from "../src/controller/route-proposer-handler/handler/balancer-pool/fetch-data";
import { ERROR } from "../src/controller/route-proposer-handler/utils/error";



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
        .get(`/getPath?tokenIn=0x8c1ec9edfcdd0aac3bf1f3a0d01612ee94bd8d6f&tokenOut=0x90412c41aabbbb771a996906dc413da9b7092077&sender=xyz&recipient=abc&deadline=12345&kind=0&slipage=0.05&amount=0.001`)
       
        // console.log(res.body)
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })
    it('it sould check getPath api by exact token Out', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x8c1ec9edfcdd0aac3bf1f3a0d01612ee94bd8d6f&tokenOut=0x90412c41aabbbb771a996906dc413da9b7092077&sender=xyz&recipient=abc&deadline=12345&kind=1&slipage=0.05&amount=1`)
        // console.log(res.body)
        expect(res.status).to.be.equal(200);
        expect(res.body.status).to.equal(true);
        expect(res.body).have.property("data");
    })

    it('it sould fail as not valid kind ', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0xcabae6f6ea1ecab08ad02fe02ce9a44f09aebfa2&tokenOut=0x0f148bf7a48dc14ee17bb4f81708c1aef20b2397&sender=xyz&recipient=abc&deadline=12345&kind=2&slipage=0.05&amount=1`)
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

    it('it sould fail as recipient in missing', async()=>{
        let res   = await chai.request(server)
        .get(`/getPath?tokenIn=0x86fb905bd14923fd66a5353d2cda955564ddb9aa&tokenOut=0xc5463c3e462e730a7bf625569e96dd275d136d2d&deadline=12345&kind=0&slipage=0.05&amount=1`)
        expect(res.status).to.be.equal(400);
        expect(res.body.status).to.equal(false);
        expect(res.body.error).to.equal(ERROR.PROPERTY_MISSING_IN_REQ_QUERY);
    })


})

