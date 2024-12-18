"use strict";

import * as modModel from "./model.js";

//local
const divScore = document.getElementById("divScore");
const divLives = document.getElementById("divLives");
const divTime = document.getElementById("divTime");

//used by move ship function
let intShipX = 5;
let blnLeft = false;
//used by update screen function and youwin
let blnSkipTimer = false;
//used to store sub movement timer handle
let intSubTimerhandle = 0;

const funcPlayAgain = () => {
  //play again?
  modModel.objPlayer.blnPlayAgain = true;
  modModel.divPlayagain.hidden = false;
  modModel.objPlayer.blnStopPlay = false;
};
const funcYouWin = () => {
  //player hit sub so stop it moving!
  window.clearInterval(intSubTimerhandle);
  //reset any existing conditions
  modModel.objPlayer.blnStopPlay = true;
  modModel.divHit.hidden = false;
  modModel.objPlayer.blnDroppedDepth = false;
  modModel.divPlayagain.hidden = true;
  //set skip timer
  blnSkipTimer = true;

  //add life as bonus!
  modModel.objPlayer.intLivesLeft++;
  //increase score
  modModel.objPlayer.intScore = modModel.objPlayer.intScore + 100;
  //stop screen update timer
  blnSkipTimer = true;
  modModel.objPlayer.intLevel++;

  window.setInterval(() => {
    modModel.objPlayer.blnStopPlay = false;
    modModel.divHit.hidden = true;

    //check if finished last level
    if (modModel.objPlayer.intLevel > 3) {
      modModel.divOver.hidden = false;

      window.setTimeout(() => {
        modModel.divOver.hidden = true;
        window.close();
      }, 10000);
    } else {
      //update timer duration and sub speed
      switch (modModel.objPlayer.intLevel) {
        case 2:
          modModel.objSub.intSubSpeed = modModel.cnstSubLevel2Speed;
          break;
        case 3:
          modModel.objSub.intSubSpeed = modModel.cnstSubLevel3Speed;
          break;
      }

      blnSkipTimer = false;
      //start sub
      funcSetupTimerSub();
    }
  }, 10000);
};
const funcShowYouLose = (blnPlayAgain = false) => {
  modModel.divYoumissed.hidden = false;

  window.setTimeout(() => {
    modModel.divYoumissed.hidden = true;

    if (blnPlayAgain) {
      funcPlayAgain();
    }
  }, 5000);
};
const funcYouLose = (blnJustLives = true) => {
  /*

     VARS

        blnjustlive - if true just decrements player lives amount and
                      checks for zero lives
                      if false player lost 
  */
  modModel.objPlayer.intLivesLeft = modModel.objPlayer.intLivesLeft - 1;

  if (modModel.objPlayer.intLivesLeft <= 0) {
    modModel.objPlayer.blnStopPlay = false;
    divLives.innerText = "Lives: " + modModel.objPlayer.intLivesLeft;
    funcShowYouLose();
    //show play again screen
    funcPlayAgain();
  }

  if (!blnJustLives) {
    modModel.divYoumissed.hidden = false;
    modModel.objPlayer.blnPlayAgain = false;
    modModel.objPlayer.blnStopPlay = true;
    //show lose AND play again
    funcShowYouLose(true);

    //need timer as if not used and just show missed dialog and pause
    //CSS does not get executed!
  }
  //player loses
  // modModel.divYoumissed.hidden = false;
  // modModel.objPlayer.blnPlayAgain = false;
  // modModel.objPlayer.blnStopPlay = true;

  // //need timer as if not used and just show missed dialog and pause
  // //CSS does not get executed!
  // window.setTimeout(() => {
  //   modModel.objPlayer.intLivesLeft = modModel.objPlayer.intLivesLeft - 1;
  //   modModel.divYoumissed.hidden = true;

  //   if (modModel.objPlayer.intLivesLeft <= 0) {
  //     modModel.objPlayer.blnStopPlay = false;
  //     divLives.innerText = "Lives: " + modModel.objPlayer.intLivesLeft;
  //     //show play again screen
  //     funcPlayAgain();
  //   } else {
  //     modModel.funcRestartLevel(false);
  //     funcUpDateScreen();
  //   }
  // }, 10000);

  //sink boat
  // modModel.imgCloud2.style.setProperty(
  //   "--varCloud2Shrink",
  //   `inset(${--varSinkShip}px 0px 0px 0px)`
  // );

  //   modModel.objPlayer.intLivesLeft = modModel.objPlayer.intLivesLeft - 1;

  //   if (modModel.objPlayer.intLivesLeft <= 0) {
  //     //show play again screen
  //     modModel.objPlayer.blnPlayAgain = true;
  //   } else {
  //     modModel.objPlayer.blnPlayAgain = false;
  //     //blnStopPlay = false;
  //   }
  // };
};

const funcDropDepth = function () {
  //drop depth charge
  let intNum = 0;
  modModel.objPlayer.blnDroppedDepth = true;

  const funcDepthDrop = window.setInterval(() => {
    /*
      drop animation AND collision detection 
      when intNun = 515 hit sea bed
    
    */

    //if <13 drop quicker as not in sea
    if (intNum <= 13) {
      modModel.imgDepth.style.top =
        modModel.funcConvertToNumber(modModel.imgDepth.style.top) + 3 + "px";
    } else {
      //drop slower as in the sea
      modModel.imgDepth.style.top =
        modModel.funcConvertToNumber(modModel.imgDepth.style.top) + 1 + "px";
    }

    intNum++;

    if (intNum === 515) {
      //stop timer
      window.clearInterval(funcDepthDrop);
      modModel.imgDepth.hidden = true;
      intNum = 0;
      modModel.objPlayer.blnDroppedDepth = false;
      funcYouLose(true);
    } else {
      //check for collision
      if (
        modModel.funcConvertToNumber(modModel.imgDepth.style.top) ===
        modModel.funcConvertToNumber(modModel.imgSub.style.top) + 30
      ) {
        //check for possible collision
        if (
          modModel.funcConvertToNumber(modModel.imgDepth.style.left) >=
            modModel.funcConvertToNumber(modModel.imgSub.style.left) &&
          modModel.funcConvertToNumber(modModel.imgDepth.style.left) <=
            modModel.funcConvertToNumber(modModel.imgSub.style.left) +
              modModel.funcConvertToNumber(modModel.imgSub.style.width) -
              10
        ) {
          //hit
          //stop timer
          window.clearInterval(funcDepthDrop);
          //hide depth charge
          modModel.imgDepth.hidden = true;
          intNum = 0;
          modModel.objPlayer.blnDroppedDepth = false;
          funcYouWin();
        }
      }
    }
  }, 100);

  intNum = 0;
};

//exports
export const funcSetupTimerSub = () => {
  intSubTimerhandle = window.setInterval(
    funcTimerMoveSub,
    modModel.objSub.intSubSpeed
  );
};

export const funcUpDateScreen = () => {
  //updates remaining lives, score and time remaining
  const funcScreenUpdate = window.setInterval(() => {
    //convert game time to min/sec
    let intSeconds = Math.floor(modModel.objPlayer.intTimeLeft / 1000);
    let intMinutes = Math.floor(intSeconds / 60);

    intSeconds = intSeconds % 60;
    intMinutes = intMinutes % 60;

    divLives.innerText = "Lives: " + modModel.objPlayer.intLivesLeft;
    divScore.innerText = "Score:" + modModel.objPlayer.intScore;

    if (!blnSkipTimer) {
      if (intSeconds >= 10) {
        divTime.innerText = `Time Remaining: ${intMinutes}:${intSeconds}`;
      } else {
        divTime.innerText = `Time Remaining: ${intMinutes}:0${intSeconds}`;
      }

      //check time expired
      if (modModel.objPlayer.intTimeLeft < 1000) {
        //disable this timer
        window.clearInterval(funcScreenUpdate);
        funcYouLose(false);
      }
    }
    //decrement time
    modModel.objPlayer.intTimeLeft = modModel.objPlayer.intTimeLeft - 1000;
  }, 1000);
};

export const funcTimerClouds = () => {
  /*
      clouds movement
  
     if cloud reaches right hand edge it "shrinks" then appears from the left
     as though it "wrapped"
  
     uses CSS to clip the cloud image
  
     Note: Did make a CSS mistake of setting position to RELATIVE which cause
           the clouds to ignore the right had margin when repeating!
           fixed by setting to : fixed - phew!
    */
  //right hand margin
  const intRightHandMargin = scrGame.clientWidth - 84;
  //default cloud positions
  let intCloud1X = modModel.cnstCloud1X;
  let intCloud2X = modModel.cnstCloud2X;
  let intCloud3X = modModel.cnstCloud3X;
  let intCloud4X = modModel.cnstCloud4X;
  let intCloud5X = modModel.cnstCloud5X;
  let intCloud6X = modModel.cnstCloud6X;
  let intCloud7X = modModel.cnstCloud7X;

  //shrink cloud notifier
  let blnCloud1Shrink = false;
  let blnCloud2Shrink = false;
  let blnCloud3Shrink = false;
  let blnCloud4Shrink = false;
  let blnCloud5Shrink = false;
  let blnCloud6Shrink = false;
  let blnCloud7Shrink = false;

  //cloud shrink amount vars
  //modifiys CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
  //changes parameter TWO: right edge
  let intCloud1ShrinkAmt = 0;
  let intCloud2ShrinkAmt = 0;
  let intCloud3ShrinkAmt = 0;
  let intCloud4ShrinkAmt = 0;
  let intCloud5ShrinkAmt = 0;
  let intCloud6ShrinkAmt = 0;
  let intCloud7ShrinkAmt = 0;

  //set default cloud positions, yes it is in the CSS BUT if the game has
  //restarted due to player winning/losing CSS values will not be read
  //again by the browser
  modModel.imgCloud1.style.left = intCloud1X + "px";
  modModel.imgCloud2.style.left = intCloud2X + "px";
  modModel.imgCloud3.style.left = intCloud3X + "px";
  modModel.imgCloud4.style.left = intCloud4X + "px";
  modModel.imgCloud5.style.left = intCloud5X + "px";
  modModel.imgCloud6.style.left = intCloud6X + "px";
  modModel.imgCloud7.style.left = intCloud7X + "px";

  //show clouds!
  modModel.imgCloud1.hidden = false;
  modModel.imgCloud2.hidden = false;
  modModel.imgCloud3.hidden = false;
  modModel.imgCloud4.hidden = false;
  modModel.imgCloud5.hidden = false;
  modModel.imgCloud6.hidden = false;
  modModel.imgCloud7.hidden = false;

  function funcCloudsTimer() {
    //check clouds x pos
    if (intCloud1X >= intRightHandMargin) {
      blnCloud1Shrink = true;
    }

    if (intCloud2X >= intRightHandMargin) {
      //115
      blnCloud2Shrink = true;
    }

    if (intCloud3X >= intRightHandMargin) {
      blnCloud3Shrink = true;
    }

    if (intCloud4X >= intRightHandMargin) {
      blnCloud4Shrink = true;
    }

    if (intCloud5X >= intRightHandMargin) {
      blnCloud5Shrink = true;
    }

    if (intCloud6X >= intRightHandMargin) {
      blnCloud6Shrink = true;
    }

    if (intCloud7X >= intRightHandMargin) {
      blnCloud7Shrink = true;
    }

    //debug data
    // document.getElementById("divDebug").style.color = "white";
    // document.getElementById("divDebug").innerText =
    //   "__" + intCloud1X + " " + scrGame.clientWidth;

    //decreasing thg cloud width pushes the other clouds left
    //by that amount!
    if (blnCloud1Shrink) {
      intCloud1ShrinkAmt++;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud1.style.setProperty(
        "--varCloud1Shrink",
        `inset(0px ${intCloud1ShrinkAmt}px 0px 0px)`
      );
    }
    if (blnCloud2Shrink) {
      intCloud2ShrinkAmt = intCloud2ShrinkAmt + 5;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud2.style.setProperty(
        "--varCloud2Shrink",
        `inset(0px ${intCloud2ShrinkAmt}px 0px 0px)`
      );
    }
    if (blnCloud3Shrink) {
      intCloud3ShrinkAmt = intCloud3ShrinkAmt + 3;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud3.style.setProperty(
        "--varCloud3Shrink",
        `inset(0px ${intCloud3ShrinkAmt}px 0px 0px)`
      );
    }
    if (blnCloud4Shrink) {
      intCloud4ShrinkAmt = intCloud4ShrinkAmt + 2;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud4.style.setProperty(
        "--varCloud4Shrink",
        `inset(0px ${intCloud4ShrinkAmt}px 0px 0px)`
      );
    }
    if (blnCloud5Shrink) {
      intCloud5ShrinkAmt = intCloud5ShrinkAmt + 4;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud5.style.setProperty(
        "--varCloud5Shrink",
        `inset(0px ${intCloud5ShrinkAmt}px 0px 0px)`
      );
    }
    if (blnCloud6Shrink) {
      intCloud6ShrinkAmt = intCloud6ShrinkAmt + 3;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud6.style.setProperty(
        "--varCloud6Shrink",
        `inset(0px ${intCloud6ShrinkAmt}px 0px 0px)`
      );
    }
    if (blnCloud7Shrink) {
      intCloud7ShrinkAmt++;
      //change CSS value:    --varCloud2Shrink : inset(0px 0px 0px 0px);
      modModel.imgCloud7.style.setProperty(
        "--varCloud7Shrink",
        `inset(0px ${intCloud7ShrinkAmt}px 0px 0px)`
      );
    }

    //move clouds
    modModel.imgCloud1.style.left = intCloud1X + "px";
    modModel.imgCloud2.style.left = intCloud2X + "px";
    modModel.imgCloud3.style.left = intCloud3X + "px";
    modModel.imgCloud4.style.left = intCloud4X + "px";
    modModel.imgCloud5.style.left = intCloud5X + "px";
    modModel.imgCloud6.style.left = intCloud6X + "px";
    modModel.imgCloud7.style.left = intCloud7X + "px";

    //handle cloud hit right margin and is now "invisible"
    //so reset the image clipping and position OFF screen
    //at the left then reset shrink vars
    if (intCloud1ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud1X = modModel.cnstCloud1X;
      modModel.imgCloud1.style.left = intCloud1X + "px";
      //unclip
      modModel.imgCloud1.style.setProperty(
        "--varCloud1Shrink",
        `inset(0px 0px 0px 0px)`
      );

      blnCloud1Shrink = false;
      //reset shrink amt
      intCloud1ShrinkAmt = 0;
    }
    if (intCloud2ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud2X = modModel.cnstCloud2X;
      intCloud2X = modModel.imgCloud2.style.left = intCloud2X + "px";
      //unclip
      modModel.imgCloud2.style.setProperty(
        "--varCloud2Shrink",
        `inset(0px 0px 0px 0px)`
      );

      blnCloud2Shrink = false;
      //reset shrink amt
      intCloud2ShrinkAmt = 0;
    }
    if (intCloud3ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud3X = modModel.cnstCloud3X;
      //unclip
      modModel.imgCloud3.style.setProperty(
        "--varCloud3Shrink",
        `inset(0px 0px 0px 0px)`
      );
      modModel.imgCloud3.style.left = intCloud3X + "px";
      blnCloud3Shrink = false;
      //reset shrink amt
      intCloud3ShrinkAmt = 0;
    }
    if (intCloud4ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud4X = modModel.cnstCloud4X;
      modModel.imgCloud4.style.left = intCloud4X + "px";

      //unclip
      modModel.imgCloud4.style.setProperty(
        "--varCloud4Shrink",
        `inset(0px 0px 0px 0px)`
      );
      blnCloud4Shrink = false;
      //reset shrink amt
      intCloud4ShrinkAmt = 0;
    }
    if (intCloud5ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud5X = modModel.cnstCloud5X;
      modModel.imgCloud5.style.left = intCloud5X + "px";
      //unclip
      modModel.imgCloud5.style.setProperty(
        "--varCloud5Shrink",
        `inset(0px 0px 0px 0px)`
      );

      blnCloud5Shrink = false;
      //reset shrink amt
      intCloud5ShrinkAmt = 0;
    }
    if (intCloud6ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud6X = modModel.cnstCloud6X;
      modModel.imgCloud6.style.left = intCloud6X + "px";

      //unclip
      modModel.imgCloud6.style.setProperty(
        "--varCloud6Shrink",
        `inset(0px 0px 0px 0px)`
      );
      blnCloud6Shrink = false;
      //reset shrink amt
      intCloud6ShrinkAmt = 0;
    }
    if (intCloud7ShrinkAmt >= 130) {
      //move off left side of screen
      intCloud7X = modModel.cnstCloud7X;
      modModel.imgCloud7.style.left = intCloud7X + "px";

      //unclip
      modModel.imgCloud7.style.setProperty(
        "--varCloud7Shrink",
        `inset(0px 0px 0px 0px)`
      );
      blnCloud7Shrink = false;
      //reset shrink amt
      intCloud7ShrinkAmt = 0;
    }
    //increment cloud positions
    intCloud1X++;
    intCloud2X = intCloud2X + 5;
    intCloud3X = intCloud3X + 3;
    intCloud4X = intCloud4X + 2;
    intCloud5X = intCloud5X + 4;
    intCloud6X = intCloud6X + 3;
    intCloud7X++;
  }

  //disable existing timer
  window.clearInterval(funcCloudsTimer);
  window.setInterval(funcCloudsTimer, 3000);
};

export const funcTimerMoveFish = () => {
  //school of fish movement

  //right hand margin
  const intRightHandMargin = scrGame.clientWidth - 35;
  //default fish positions
  let intFish1X = modModel.cnstFish1X;
  let intFish2X = modModel.cnstFish2X;
  let intFish3X = modModel.cnstFish3X;
  let intFish4X = modModel.cnstFish4X;

  //shrink fish notifier
  let blnShrinkFish1 = false;
  let blnShrinkFish2 = false;
  let blnShrinkFish3 = false;
  let blnShrinkFish4 = false;

  //fish shrink amount vars
  //modifiys CSS value:    --varShrinkFish1 : inset(0px 0px 0px 0px);
  //changes parameter TWO: right edge
  let intShrinkFish1Amt = 0;
  let intShrinkFish2Amt = 0;
  let intShrinkFish3Amt = 0;
  let intShrinkFish4Amt = 0;

  //set default fish positions, yes it is in the CSS BUT if the game has
  //restarted due to player winning/losing CSS values will not be read
  //again by the browser
  modModel.imgFish1.style.left = intFish1X + "px";
  modModel.imgFish2.style.left = intFish2X + "px";
  modModel.imgFish3.style.left = intFish3X + "px";
  modModel.imgFish4.style.left = intFish4X + "px";

  //show fish!
  modModel.imgFish1.hidden = false;
  modModel.imgFish2.hidden = false;
  modModel.imgFish3.hidden = false;
  modModel.imgFish4.hidden = false;

  function funcFishTimer() {
    //check fish x pos
    if (intFish1X >= intRightHandMargin) {
      blnShrinkFish1 = true;
    }
    if (intFish2X >= intRightHandMargin) {
      blnShrinkFish2 = true;
    }
    if (intFish3X >= intRightHandMargin) {
      blnShrinkFish3 = true;
    }
    if (intFish4X >= intRightHandMargin) {
      blnShrinkFish4 = true;
    }

    if (blnShrinkFish1) {
      intShrinkFish1Amt = intShrinkFish1Amt + 10;
      //change CSS value:
      modModel.imgFish1.style.setProperty(
        "--varShrinkFish1",
        `inset(0px ${intShrinkFish1Amt}px 0px 0px)`
      );
    }

    if (blnShrinkFish2) {
      intShrinkFish2Amt = intShrinkFish2Amt + 10;
      //change CSS value:
      modModel.imgFish2.style.setProperty(
        "--varShrinkFish2",
        `inset(0px ${intShrinkFish2Amt}px 0px 0px)`
      );
    }
    if (blnShrinkFish3) {
      intShrinkFish3Amt = intShrinkFish3Amt + 10;
      //change CSS value:
      modModel.imgFish3.style.setProperty(
        "--varShrinkFish3",
        `inset(0px ${intShrinkFish3Amt}px 0px 0px)`
      );
    }
    if (blnShrinkFish4) {
      intShrinkFish4Amt = intShrinkFish4Amt + 3;
      //change CSS value:
      modModel.imgFish4.style.setProperty(
        "--varShrinkFish4",
        `inset(0px ${intShrinkFish4Amt}px 0px 0px)`
      );
    }
    //move fish
    modModel.imgFish1.style.left = intFish1X + "px";
    modModel.imgFish2.style.left = intFish2X + "px";
    modModel.imgFish3.style.left = intFish3X + "px";
    modModel.imgFish4.style.left = intFish4X + "px";

    //handle sub hits right margin and is now "invisible"
    //so reset the image clipping and position OFF screen
    //at the left then reset shrink vars
    if (intShrinkFish1Amt >= 130) {
      //move off left side of screen
      intFish1X = modModel.cnstFish1X;
      //unclip
      modModel.imgFish1.style.setProperty(
        "--varShrinkFish1",
        `inset(0px 0px 0px 0px)`
      );
      modModel.imgFish1.style.left = intFish1X + "px";
      blnShrinkFish1 = false;
      //reset shrink amt
      intShrinkFish1Amt = 0;
    }
    if (intShrinkFish2Amt >= 130) {
      //move off left side of screen
      intFish2X = modModel.cnstFish2X;
      //unclip
      modModel.imgFish2.style.setProperty(
        "--varShrinkFish2",
        `inset(0px 0px 0px 0px)`
      );
      modModel.imgFish2.style.left = intFish2X + "px";
      blnShrinkFish2 = false;
      //reset shrink amt
      intShrinkFish2Amt = 0;
    }
    if (intShrinkFish3Amt >= 130) {
      //move off left side of screen
      intFish3X = modModel.cnstFish3X;
      //unclip
      modModel.imgFish3.style.setProperty(
        "--varShrinkFish3",
        `inset(0px 0px 0px 0px)`
      );
      modModel.imgFish3.style.left = intFish3X + "px";
      blnShrinkFish3 = false;
      //reset shrink amt
      intShrinkFish3Amt = 0;
    }
    if (intShrinkFish4Amt >= 130) {
      //move off left side of screen
      intFish4X = modModel.cnstFish4X;
      //unclip
      modModel.imgFish4.style.setProperty(
        "--varShrinkFish4",
        `inset(0px 0px 0px 0px)`
      );
      modModel.imgFish4.style.left = intFish4X + "px";
      blnShrinkFish4 = false;
      //reset shrink amt
      intShrinkFish4Amt = 0;
    }

    //increment fish positions
    intFish1X = intFish1X + 3;
    intFish2X = intFish2X + 3;
    intFish3X = intFish3X + 3;
    intFish4X = intFish4X + 3;
  }

  //disable existing timer
  window.clearInterval(funcFishTimer);
  window.setInterval(funcFishTimer, 500);
  //  };
};

export const funcTimerMoveSub = () => {
  /*
      subs movement
  
     if sub reaches right hand edge it "shrinks" then appears from the left
     as though it "wrapped"
  
     uses CSS to clip the sub image
  
     Note: Did make a CSS mistake of setting position to RELATIVE which cause
           the sub to ignore the right had margin when repeating!
           fixed by setting to : fixed - phew!
    */

  //check sub x pos
  if (modModel.objSub.intSubX >= modModel.objSub.intRightHandMargin) {
    modModel.objSub.blnSubShrink = true;
  }

  if (modModel.objSub.blnSubShrink) {
    modModel.objSub.intSubShrinkAmt = modModel.objSub.intSubShrinkAmt + 20;
    modModel.imgSub.style.setProperty(
      "--varSubShrink",
      `inset(0px ${modModel.objSub.intSubShrinkAmt}px 0px 0px)`
    );
  }
  //move sub
  modModel.imgSub.style.left = modModel.objSub.intSubX + "px";

  //handle sub hits right margin and is now "invisible"
  //so reset the image clipping and position OFF screen
  //at the left then reset shrink vars
  if (modModel.objSub.intSubShrinkAmt >= 130) {
    //move off left side of screen
    modModel.objSub.intSubX = -190;
    //unclip
    modModel.imgSub.style.setProperty(
      "--varSubShrink",
      `inset(0px 0px 0px 0px)`
    );
    modModel.imgSub.style.left = modModel.objSub.intSubX + "px";
    modModel.objSub.blnSubShrink = false;
    //reset shrink amt
    modModel.objSub.intSubShrinkAmt = 0;
  }

  //increment sub position
  modModel.objSub.intSubX = modModel.objSub.intSubX + 20;
};

//export const funcTimerMoveSub = (blnDisable = false) => {
//sub movement

// const funcTimerSub = () => {
/*
      subs movement
  
     if sub reaches right hand edge it "shrinks" then appears from the left
     as though it "wrapped"
  
     uses CSS to clip the sub image
  
     Note: Did make a CSS mistake of setting position to RELATIVE which cause
           the sub to ignore the right had margin when repeating!
           fixed by setting to : fixed - phew!
    */

// //right hand margin
// const intRightHandMargin = scrGame.clientWidth - 160;
// //default sub positions
// let intDefaultSubX = 5;

// //cloud position vars
// let intSubX = intDefaultSubX;

// //shrink sub notifier
// let blnSubShrink = false;

// //sub shrink amount vars
// //modifiys CSS value:    --varSubhrink : inset(0px 0px 0px 0px);
// //changes parameter TWO: right edge
// let intSubShrinkAmt = 0;

// //set default fish position, yes it is in the CSS BUT if the game has
// //restarted due to player winning/losing CSS values will not be read
// //again by the browser
// modModel.imgSub.style.left = intDefaultSubX + "px";

// //show attack sub!
// modModel.imgSub.hidden = false;

// const funcSubTimer = () => {
//   //check sub x pos
//   if (intSubX >= intRightHandMargin) {
//     blnSubShrink = true;
//   }

//   if (blnSubShrink) {
//     intSubShrinkAmt = intSubShrinkAmt + 20;
//     modModel.imgSub.style.setProperty(
//       "--varSubShrink",
//       `inset(0px ${intSubShrinkAmt}px 0px 0px)`
//     );
//   }
//   //move sub
//   modModel.imgSub.style.left = intSubX + "px";

//   //handle sub hits right margin and is now "invisible"
//   //so reset the image clipping and position OFF screen
//   //at the left then reset shrink vars
//   if (intSubShrinkAmt >= 130) {
//     //move off left side of screen
//     intSubX = -190;
//     //unclip
//     modModel.imgSub.style.setProperty(
//       "--varSubShrink",
//       `inset(0px 0px 0px 0px)`
//     );
//     modModel.imgSub.style.left = intSubX + "px";
//     blnSubShrink = false;
//     //reset shrink amt
//     intSubShrinkAmt = 0;
//   }

//   //increment sub position
//   intSubX = intSubX + 20;
// };

// //create timer or remove?
//   if (blnDisable) {
//     //disable existing timer
//     window.clearInterval(funcSubTimer);
//   } else {
//     window.setInterval(funcSubTimer, modModel.objPlayer.intSubSpeed);
//   }
// };

export const funcMoveShip = function (intDirection) {
  /*
      moves boat, stops at right/left screen edge
      if at edge of screen and opposite diection pressed 
      flips boat image 
  
    */

  //right hand margin
  const intRightHandMargin = scrGame.clientWidth - 162;
  let intNum = 0;

  switch (intDirection) {
    case 1:
      intShipX = intShipX + 4;

      if (intShipX >= intRightHandMargin) {
        intShipX = intRightHandMargin;
      }
      //flip ship image
      modModel.imgBoat.style.setProperty("transform", "scaleX(1)");
      blnLeft = false;
      break;
    case 0:
      intShipX = intShipX - 4;

      if (intShipX <= 5) {
        intShipX = 5;
      }
      //flip ship image
      modModel.imgBoat.style.setProperty("transform", "scaleX(-1)");
      blnLeft = true;
      break;
    case 2:
      //check not already dropped one
      if (modModel.objPlayer.blnDroppedDepth) {
        break;
      }

      //drop depth charge
      modModel.imgDepth.hidden = false;
      modModel.imgDepth.style.top = 325 + "px";
      //5px in same pos as last charge on boat
      if (blnLeft) {
        modModel.imgDepth.style.left =
          modModel.imgBoat.width + intShipX - 7 + "px";
      } else {
        modModel.imgDepth.style.left = intShipX - 12 + "px";
      }

      funcDropDepth();
      break;
  }

  //set ship position
  modModel.imgBoat.style.left = intShipX + "px";
};
