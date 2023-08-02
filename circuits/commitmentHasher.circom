pragma circom 2.0.0;

include "./utils/padersen.circom";

template CommitmentHasher() {

    signal input nullifier[256];
    signal input secret[256];
    signal output commitment;
    signal output nullifierHash;

    component comhasher = Pedersen(512);
    component nulhasher = Pedersen(256);

    for (var i=0; i<256; i++){
        comhasher.in[i] <== nullifier[i];
        comhasher.in[i+256] <== secret[i];
        nulhasher.in[i] <== nullifier[i];
    }

    commitment <== comhasher.o;
    nullifierHash <== nulhasher.o;   
}
