//Generate unique tetrominoes in an array
const generate = (() => {
    let bag = [0, 1, 2, 3, 4, 5, 6]; //default array to be randomly swapped
    let refillBag = [0, 1, 2, 3, 4, 5, 6]; //a bag that refills the initial bag
    let hold = []; //hold piece
    let current = -1; //current piece
    const TOTAL_PIECES = 7; //total existing tetrominoes
    return {
        hold,
        current,
        //insert hold tetro to current piece index
        holdToCurrent(i) { bag.unshift(i); },
        getBag() { return bag; },  //get bag array
        getPiece(i) { return bag[i]; }, //generate piece
        getRefillBag(i) { return refillBag; },
        //refill the empty bag with unique tetrominoes
        //swapping each elements of the existing array
        tetrotetro(b) {
            if (refillBag.length === 0) { generate.newBag(); }
            for (let j = TOTAL_PIECES - 1; j >= 0; j--) {
                let swapIndex = Math.floor(Math.random() * j);
                let tmp = b[swapIndex];
                b[swapIndex] = b[j];
                b[j] = tmp;
            }
        },
        newBag() {
            refillBag = [0, 1, 2, 3, 4, 5, 6];
        }
    }
})()

export default generate;
