# Note
This project is under development and will be completed in 1-2 days(Hopefully). Just some errors are stopping its completion. But if you want to understand the project, below is the whole mechanism how this project works.

# Description
So this a Market Place, but not just a normal market place its a zero knowledge(zk-snark) market place, Where nft is not directly mapped to the owner address but rather it's nullifier hash. And we can prove the existance of onwer using groth16 method of finding proof which is implemented using snarkjs. You can see the circom circuits in in circuit folder. 

A special NFT has been made which does not inheriting ERC721 and functions like mint, trasnfer, transferFrom, etc. are defined with respect to the nullifierhash which deployed and interacted with hardhat framework.

The frontend uses Graph for indexing of the events and rest is just like a normal decentralised application on hardhart framework and using NEXTjs for the frontend.

A question that I had earlier and you may also have is

## Why do we need circom?
Circom is designed to represent the underlying circuit used in zk-SNARKs in an efficient and concise manner. A circuit is a collection of logical gates and data paths that represent the computation involved in the proof. Circom allows developers to describe complex computations as a circuit, which is later used to generate a zk-SNARK.

One of the key features of zk-SNARKs is their succinctness. They enable very short proofs and verification times compared to traditional zero-knowledge proofs. Circom is optimized for creating circuits that result in highly succinct(short) proofs.

Circom is tailored for performance, and zk-SNARKs have applications in scenarios where computational resources are limited. By using Circom, it becomes possible to generate proofs that can be efficiently verified on resource-constrained devices.

zk-SNARKs can be composed, meaning that multiple zk-SNARKs can be linked together to prove more complex statements. Circom allows us to design circuits that can be easily composed with other circuits, providing flexibility in building larger, more intricate proofs.

Circom is designed to be interoperable with other components of the zk-SNARK system, such as proving systems like libsnark or bellman, and pairing-based elliptic curve libraries. This ensures a smooth integration of the various components of a zk-SNARK implementation.
