import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { FakeContract, smock } from "@defi-wonderland/smock";

import {
    RipProtocolStaking,
    RipProtocolTreasury,
    RipProtocolERC20Token,
    RipProtocolERC20Token__factory,
    SRipProtocol,
    SRipProtocol__factory,
    GRIP,
    RipProtocolAuthority__factory,
} from "../../types";

const TOTAL_GONS = 5000000000000000;
const ZERO_ADDRESS = ethers.utils.getAddress("0x0000000000000000000000000000000000000000");

describe("sRip", () => {
    let initializer: SignerWithAddress;
    let alice: SignerWithAddress;
    let bob: SignerWithAddress;
    let rip: RipProtocolERC20Token;
    let sRip: SRipProtocol;
    let gRipFake: FakeContract<GRIP>;
    let stakingFake: FakeContract<RipProtocolStaking>;
    let treasuryFake: FakeContract<RipProtocolTreasury>;

    beforeEach(async () => {
        [initializer, alice, bob] = await ethers.getSigners();
        stakingFake = await smock.fake<RipProtocolStaking>("RipProtocolStaking");
        treasuryFake = await smock.fake<RipProtocolTreasury>("RipProtocolTreasury");
        gRipFake = await smock.fake<GRIP>("gRIP");

        const authority = await new RipProtocolAuthority__factory(initializer).deploy(
            initializer.address,
            initializer.address,
            initializer.address,
            initializer.address
        );
        rip = await new RipProtocolERC20Token__factory(initializer).deploy(authority.address);
        sRip = await new SRipProtocol__factory(initializer).deploy();
    });

    it("is constructed correctly", async () => {
        expect(await sRip.name()).to.equal("Staked RIP");
        expect(await sRip.symbol()).to.equal("sRIP");
        expect(await sRip.decimals()).to.equal(9);
    });

    describe("initialization", () => {
        describe("setIndex", () => {
            it("sets the index", async () => {
                await sRip.connect(initializer).setIndex(3);
                expect(await sRip.index()).to.equal(3);
            });

            it("must be done by the initializer", async () => {
                await expect(sRip.connect(alice).setIndex(3)).to.be.reverted;
            });

            it("cannot update the index if already set", async () => {
                await sRip.connect(initializer).setIndex(3);
                await expect(sRip.connect(initializer).setIndex(3)).to.be.reverted;
            });
        });

        describe("setgRIP", () => {
            it("sets gRipFake", async () => {
                await sRip.connect(initializer).setgRIP(gRipFake.address);
                expect(await sRip.gRIP()).to.equal(gRipFake.address);
            });

            it("must be done by the initializer", async () => {
                await expect(sRip.connect(alice).setgRIP(gRipFake.address)).to.be.reverted;
            });

            it("won't set gRipFake to 0 address", async () => {
                await expect(sRip.connect(initializer).setgRIP(ZERO_ADDRESS)).to.be.reverted;
            });
        });

        describe("initialize", () => {
            it("assigns TOTAL_GONS to the stakingFake contract's balance", async () => {
                await sRip
                    .connect(initializer)
                    .initialize(stakingFake.address, treasuryFake.address);
                expect(await sRip.balanceOf(stakingFake.address)).to.equal(TOTAL_GONS);
            });

            it("emits Transfer event", async () => {
                await expect(
                    sRip.connect(initializer).initialize(stakingFake.address, treasuryFake.address)
                )
                    .to.emit(sRip, "Transfer")
                    .withArgs(ZERO_ADDRESS, stakingFake.address, TOTAL_GONS);
            });

            it("emits LogStakingContractUpdated event", async () => {
                await expect(
                    sRip.connect(initializer).initialize(stakingFake.address, treasuryFake.address)
                )
                    .to.emit(sRip, "LogStakingContractUpdated")
                    .withArgs(stakingFake.address);
            });

            it("unsets the initializer, so it cannot be called again", async () => {
                await sRip
                    .connect(initializer)
                    .initialize(stakingFake.address, treasuryFake.address);
                await expect(
                    sRip.connect(initializer).initialize(stakingFake.address, treasuryFake.address)
                ).to.be.reverted;
            });
        });
    });

    describe("post-initialization", () => {
        beforeEach(async () => {
            await sRip.connect(initializer).setIndex(1);
            await sRip.connect(initializer).setgRIP(gRipFake.address);
            await sRip.connect(initializer).initialize(stakingFake.address, treasuryFake.address);
        });

        describe("approve", () => {
            it("sets the allowed value between sender and spender", async () => {
                await sRip.connect(alice).approve(bob.address, 10);
                expect(await sRip.allowance(alice.address, bob.address)).to.equal(10);
            });

            it("emits an Approval event", async () => {
                await expect(await sRip.connect(alice).approve(bob.address, 10))
                    .to.emit(sRip, "Approval")
                    .withArgs(alice.address, bob.address, 10);
            });
        });

        describe("increaseAllowance", () => {
            it("increases the allowance between sender and spender", async () => {
                await sRip.connect(alice).approve(bob.address, 10);
                await sRip.connect(alice).increaseAllowance(bob.address, 4);

                expect(await sRip.allowance(alice.address, bob.address)).to.equal(14);
            });

            it("emits an Approval event", async () => {
                await sRip.connect(alice).approve(bob.address, 10);
                await expect(await sRip.connect(alice).increaseAllowance(bob.address, 4))
                    .to.emit(sRip, "Approval")
                    .withArgs(alice.address, bob.address, 14);
            });
        });

        describe("decreaseAllowance", () => {
            it("decreases the allowance between sender and spender", async () => {
                await sRip.connect(alice).approve(bob.address, 10);
                await sRip.connect(alice).decreaseAllowance(bob.address, 4);

                expect(await sRip.allowance(alice.address, bob.address)).to.equal(6);
            });

            it("will not make the value negative", async () => {
                await sRip.connect(alice).approve(bob.address, 10);
                await sRip.connect(alice).decreaseAllowance(bob.address, 11);

                expect(await sRip.allowance(alice.address, bob.address)).to.equal(0);
            });

            it("emits an Approval event", async () => {
                await sRip.connect(alice).approve(bob.address, 10);
                await expect(await sRip.connect(alice).decreaseAllowance(bob.address, 4))
                    .to.emit(sRip, "Approval")
                    .withArgs(alice.address, bob.address, 6);
            });
        });

        describe("circulatingSupply", () => {
            it("is zero when all owned by stakingFake contract", async () => {
                await stakingFake.supplyInWarmup.returns(0);
                await gRipFake.totalSupply.returns(0);
                await gRipFake.balanceFrom.returns(0);

                const totalSupply = await sRip.circulatingSupply();
                expect(totalSupply).to.equal(0);
            });

            it("includes all supply owned by gRipFake", async () => {
                await stakingFake.supplyInWarmup.returns(0);
                await gRipFake.totalSupply.returns(10);
                await gRipFake.balanceFrom.returns(10);

                const totalSupply = await sRip.circulatingSupply();
                expect(totalSupply).to.equal(10);
            });

            it("includes all supply in warmup in stakingFake contract", async () => {
                await stakingFake.supplyInWarmup.returns(50);
                await gRipFake.totalSupply.returns(0);
                await gRipFake.balanceFrom.returns(0);

                const totalSupply = await sRip.circulatingSupply();
                expect(totalSupply).to.equal(50);
            });
        });
    });
});
