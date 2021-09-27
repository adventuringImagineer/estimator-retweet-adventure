// Copyright © ThroughPuter, Inc. Patents issued and pending.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

// A Rock-Paper-Scissors demo game.

class ReTweet extends Vue {
	constructor(arg) {
		super(arg);

		let retweet = this;
		let payload = arg.payload;
		let retweeted = arg.retweeted;
		let url = arg.url
		this.ahph_index = 0;
		this.ahpl_index = 0;
		this.ahpn_index = 0;
		this.alph_index = 0;
		this.alpl_index = 0;
		this.alpn_index = 0;
		this.anph_index = 0;
		this.anpl_index = 0;
		this.anpn_index = 0;
		// The depth of the human play history used to make predictions (# X variables for predictor).
		this.HISTORY_DEPTH = 4;
		// History of plays made by AI, for all of time. (Human history is this.premonition.history.)
		// [0] is the first play, and so on.
		// Note that the next AI play is determined immediately once the human makes a play, so the AI is
		// generally ahead by one play.
		this.ai_history = [];
		this.countAI = 0;
		this.last5Prediction = [];
		this.countLast5 = 0;
		this.labs = [];
		this.clicks = 0;
		this.ai_correct = [];
		this.ai_wrong = [];
		this.ai_pie = [0, 0];
		this.check = true;
		this.differ = 0;
		this.prev_ai = 0;
		this.prev_human = 0;
		this.prev_random = 0;
		// Running totals.
		this.wins = {
			retweeted: 0,
			ai: 0,
			tie: 0,
		};
		// if (ai_index == 0){
		this.winner_message = {
			retweeted: "Incorrect",
			ai: "Correct",
			// tie: "Tie",
		};
		this.prediction_message = {
			//matches
			ai_high: "Prediction: High Retweet Probability",
			ai_low: "Prediction: Low Retweet Probability",
			ai_no: "Prediction: No Retweet",
			//non-matches
			retweet_high_ai_no: "Prediction: No Retweet",
			retweet_low_ai_no: "Prediction: No Retweet",
			retweet_no_ai_high: "Prediction: High Retweet Probability",
			retweet_no_ai_low: "Prediction: Low Retweet Probability",
			retweet_high_ai_low: "Prediction: Low Retweet Probability",
			retweet_low_ai_high: "Prediction: High Retweet Probability",
			error: "Error: No Prediction Results to give.",
		};
		this.actual_message = {
			//matches
			ai_high: "Actual: High Retweet Probability",
			ai_low: "Actual: Low Retweet Probability",
			ai_no: "Actual: No Retweet",
			//non-matches
			retweet_high_ai_no: "Actual: High Retweet Probability",
			retweet_low_ai_no: "Actual: Low Retweet Probability",
			retweet_no_ai_high: "Actual: No Retweet",
			retweet_no_ai_low: "Actual: No Retweet",
			retweet_high_ai_low: "Actual: High Retweet Probability",
			retweet_low_ai_high: "Actual: Low Retweet Probability",
			error: "Error: No Prediction Results to give.",
		};

		this.lineChart = new Chart(document.getElementById("line-chart"), {
		  type: "line",
		  data: {
		    // labels: this.labs,
		    labels: [],
		    datasets: [
		      {
		        // data: this.ai_wrong,
		        data: [],
		        label: "Statistical longer term probability of correct predictions",
		        borderColor: "#000000",
		        borderDash: [5, 5],
		        borderWidth: 1,
		        pointRadius: 0,
		        fill: false,
		      },
		      {
		        // data:this.ai_correct,
		        data: [],
		        label: "AI correct",
		        borderColor: "#3e62cd",
		        fill: false,
		      },
		    ],
		  },
		  options: {
		    title: {
		      display: true,
		      text:
		        "AI predictions correct % cumulatively from 5th round on, excluding tie's",
		    },
		    layout: {
		      padding: {
		        left: 50,
		        right: 0,
		        top: 0,
		        bottom: 0,
		      },
		    },
		    scales: {
		      yAxes: [
		        {
		          scaleLabel: {
		            display: true,
		            labelString: "Percentage (%)",
		          },
		          ticks: {
		            max: 100,
		            min: 0,
		            stepSize: 25,
		          },
		        },
		      ],
		      xAxes: [
		        {
		          scaleLabel: {
		            display: true,
		            labelString: "Number of calls",
		          },
		          ticks: {
		            max: 150,
		            min: 5,
		            maxTicksLimit: 20,
		          },
		        },
		      ],
		    },
		    legend: {
		      onClick: function (e) {
		        e.stopPropagation();
		      },
		    },
		  },
		});

		this.pieChart = new Chart(document.getElementById("pie-chart"), {
		  type: "pie",
		  data: {
		    labels: [],
		    datasets: [
		      {
		        label: "Last 10 predictions",
		        backgroundColor: ["#3e62cd", "#f03c3c"],
		        data: [0, 0],
		      },
		    ],
		  },
		  options: {
		    title: {
		      display: true,
		      text: "AI predictions correct % for last 10 rounds, excluding tie's",
		    },
		    layout: {
		      padding: {
		        left: 50,
		        right: 0,
		        top: 0,
		        bottom: 0,
		      },
		    },
		    legend: {
		      onClick: function (e) {
		        e.stopPropagation();
		      },
		    },
		  },
		});

		// ****************************
		// DEBUG
		//
		// Automated human plays for debug.
		this.auto_play = [
			/*
			0,0,0,0,0,0,0,0,0,0,
			1,1,1,1,1,1,1,1,1,1,
			2,2,2,2,2,2,2,2,2,2
			*/
		];

		//popup when Websocket stops
		let onclosefn = function () {
			alert("WebSocket connection closed. Refreshing page.");
			location.reload();
		};
		let onerrorfn = function () {
			alert("Error occured");
		};
		let wsReady;
		try {wsReady = function () {
			// Websocket is ready. Start doing stuff.

			try {
				retweet.makePrediction();
			} catch {
				alert("inside estimator.js stopped");
			}

			// JQuery bindings.

			$("#tweet").click(function (evt) {
				if (retweet.ready) {
					let val = payload.shift();
					let hand_index = retweeted.shift();
					try {
						$(`#human-player .hand-container[data-hand-index=${hand_index}]`);
						retweet.determineWinner(val, hand_index);
						retweet.makePrediction();
					} catch (err) {
						console.log("Error in wsReady function:", err)
						alert("Error in wsReady, reloading page");
						location.reload();
					}
				}
			});
		};
	}
		catch (e) {
			console.log('wsready e: ', e);
		}

		let predictionCB = (preds, info) => {
			retweet.predictionCB(preds, info);
		};

		// To utilize your access to a ThroughPuter Estimator microservice, provide your secret key here, HOWEVER...
		// IMPORTANT!!! It is your responsibility to keep your secret key secret. This code is visible in a user's web browser,
		//              and this demo is not intended to be hosted publicly with your private key.

		this.prediction = new Prediction(
			4,
			true,
			url,
			predictionCB,
			{ onopen: wsReady, onclose: onclosefn, onerror: onerrorfn }
		);

		//wsReady();
	}//ends constructor

	// Return a random hand index.
	randomHandIndex() {
		return Math.floor(Math.random() * 2);
	}

	// Determine winning play against opponent's play.
	winningIndex(index) {
		return (index + 1) % 3;
	}
	// Return human", "ai", or "tie" for a contest.
	winner(retweeted_index, ai_index) {
		return retweeted_index == ai_index
			? "ai"
			: "retweeted";
	}

	// Return results of AI's predictions.
	prediction_result(ai_index, retweeted_index) {
		return ai_index == retweeted_index && retweeted_index == 0
			? "ai_no"
			: ai_index == retweeted_index && retweeted_index == 1
				? "ai_low"
			: ai_index == retweeted_index && retweeted_index == 2
				? "ai_high"
				: ai_index != retweeted_index && ai_index == 0 && retweeted_index == 1
					? "retweet_low_ai_no"
					: ai_index != retweeted_index && ai_index == 0 && retweeted_index == 2
						? "retweet_high_ai_no"
						: ai_index != retweeted_index && ai_index == 1 && retweeted_index == 0
							? "retweet_no_ai_low"
							: ai_index != retweeted_index && ai_index == 1 && retweeted_index == 2
								? "retweet_high_ai_low"
								: ai_index != retweeted_index && ai_index == 2 && retweeted_index == 0
									? "retweet_no_ai_high"
									: ai_index != retweeted_index && ai_index == 2 && retweeted_index == 1
										? "retweet_low_ai_high"
											: "error";
	}
	// The human has played. Conduct the contest.
	determineWinner(payload_array, retweeted_index) {
		var rand = Math.floor(Math.random() * 2);
		if (this.clicks == 4) {
			document.getElementById("info").style.display = "none";
		} else {
			var left = 4 - this.clicks;
			document.getElementById(
				"info"
			).innerHTML = `AI initial training period. The tweets are hardcoded and the predictions are random for first 4 clicks. (${left} click/s left)`;
			document.getElementById("info").style.color = "royalblue";
		}
		// Update state.
		try {
			this.prediction.pushValue(payload_array);
			this.prediction.pushRetweetIndex(retweeted_index);
		} catch (err) {
			alert("Estimator has stopped", err);
		}

		let ai_index = this.ai_history[this.ai_history.length - 1];

		this.confusionMatrix(ai_index, retweeted_index);
		//winner
		let winner = this.winner(retweeted_index, ai_index);
		console.log("human, ai, winner: ", retweeted_index, ai_index, winner);
		let prediction_res = this.prediction_result(ai_index, retweeted_index);
		if (this.clicks >= 4) {
			this.wins[winner]++;
		}
		// Reflect AI play in DOM.
		$(`#${winner}-score`).text(this.wins[winner].toString());
		// $("#AI-player .hand-container").removeClass("selected");
		$(`#AI-player .hand-container[data-hand-index=${ai_index}]`)
			// .addClass("selected")
			;
		$("#winner-message").text(this.winner_message[winner]);
		$("#prediction-message").text(this.prediction_message[prediction_res]);
		$("#actual-message").text(this.actual_message[prediction_res]);
		console.log(
			`Contest: Human: ${retweeted_index}; AI: ${ai_index}. ${this.winner_message[winner]}`
		);

		if (this.clicks >= 4) {
		  if (winner == "ai") {
		    this.countAI++;
		  }

		  if (this.countLast5 < 10) {
		    if (!winner.match("tie")) {
		      this.last5Prediction.push(winner);
		      this.countLast5 += 1;
		    }
		  } else {
		    if (!winner.match("tie")) {
		      this.last5Prediction.shift();
		      this.last5Prediction.push(winner);
		    }
		  }
		  var countAI5 = 0;
		  console.log("last 10 prediction: ", this.last5Prediction);
		  for (var i = 0; i < this.last5Prediction.length; ++i) {
		    if (this.last5Prediction[i] == "ai") {
		      countAI5++;
		    }
		  }
		  //popup when 4 out of last 5 AI predictions are correct
		  if (countAI5 == 7 && this.clicks > this.differ + 7) {
		    document.getElementsByTagName("button")[0].click();
		    this.differ = this.clicks;
		  }

		  var last5_percent = (
		    (countAI5 / this.last5Prediction.length) *
		    100
		  ).toFixed(0);
		  if (last5_percent.match(NaN)) {
		    console.log("inside NaN: ", last5_percent);
		    this.ai_pie[0] = 0;
		    this.ai_pie[1] = 0;
		  } else {
		    this.ai_pie[0] = last5_percent;
		    this.ai_pie[1] = 100 - last5_percent;
		  }

		  this.pieChart.data.labels[0] = "AI correct " + this.ai_pie[0] + " %";
		  this.pieChart.data.labels[1] = "AI wrong " + this.ai_pie[1] + " %";

		  // console.log('Pie chart labels 0: ', this.pieChart.data.labels[0])
		  // console.log('Pie chart labels 1: ', this.pieChart.data.labels[1])
		  this.pieChart.data.datasets[0].data.splice(0, 2);
		  this.pieChart.data.datasets[0].data.push(this.ai_pie[0]);
		  this.pieChart.data.datasets[0].data.push(this.ai_pie[1]);
		  //   console.log('Pie chart dataset : ', this.pieChart.data.datasets.data)
		  // console.log('countAI, last 5 percent, this.last5Prediction.length  ', countAI, last5_percent, this.last5Prediction.length)

		  if (this.clicks >= 4) {
		    document.getElementById("piegraph").style.display = "flex";
		    this.pieChart.update();
		  }
		}
		this.clicks++;
		if (this.clicks >= 5) {
		  // random number always 50%
		  this.lineChart.data.datasets[0].data.push(50);

		  // this.labs.push(this.clicks);
		  this.lineChart.data.labels.push(this.clicks);
		  // console.log('Line chart labels: ', this.lineChart.data.labels)
		  var percent = 0;
		  // console.log('labs pushed: ', this.labs)

		  if (winner == "ai") {
		    // console.log('inside ai wins')
		    percent = (
		      ((this.prev_ai + 1) / (this.prev_ai + this.prev_human + 1)) *
		      100
		    ).toFixed(0);
		    // console.log("percent AI pushed: ", percent);
		    //   this.ai_correct.push(percent)
		    //   this.ai_wrong.push(100 - percent)
		    this.prev_ai++;
		    // when correct AI
		    this.lineChart.data.datasets[1].data.push(percent);

		    // when AI wrong so random number

		    if (ai_index == rand) {
		      this.prev_random++;
		    } else {
		    }
		  } else if (winner == "retweeted") {
		    percent = (
		      (this.prev_ai / (this.prev_ai + this.prev_human + 1)) *
		      100
		    ).toFixed(0);
		    this.prev_human++;

		    this.lineChart.data.datasets[1].data.push(percent);
		    // when AI wrong so random number

		    if (retweeted_index == rand) {
		      this.prev_random++;
		      // console.log("Rand == human, random pushed: ", rand_percent)
		    } else {
		    }
		  } else {
		    // console.log("inside tie wins");
		    this.lineChart.data.datasets[1].data.push(
		    this.lineChart.data.datasets[1].data.slice(-1)[0]
		    );
		  }

		  //avoid initial ai score to be 100%
		  if (this.lineChart.data.datasets[1].data.length == 1) {
		    this.lineChart.data.datasets[1].data.splice(0, 1);
		    this.lineChart.data.datasets[1].data.push(0);
		    // $("#winner-message").text("You WON!!!");
		  }
		  if (this.lineChart.data.datasets[1].data.length == 2) {
		    this.lineChart.data.datasets[1].data.splice(1, 2);
		    this.lineChart.data.datasets[1].data.push(0);
		    // $("#winner-message").text("You WON!!!");
		  }

		  if (this.clicks >= 5) {
		    document.getElementById("linegraph").style.display = "flex";
		    this.lineChart.update();
		  }
		}

		if (
		  this.countAI == this.clicks - this.countAI + 7 &&
		  this.clicks > this.differ + 7
		) {
		  this.check = false;
		  document.getElementsByTagName("button")[0].click();
		  this.differ = this.clicks;
		}
	}

	predictionCB(preds, info) {
		let pred_index = preds[0].est;
		var ai_play_index = pred_index;
		this.ai_history.push(ai_play_index);
		// Ready to play, but introduce a minimum delay while the DOM conveys the result of the previous battle.
		$(".probabilities").text(""); // Clear old predictions in DOM.
		window.setTimeout(() => {
			// Reflect selection in DOM.
			$(`#AI-player .hand-container[data-hand-index=${ai_play_index}]`);
			preds.forEach((pred, index) => {
				$(`.probability[index=${this.winningIndex(pred.est)}]`).text(
					`${(pred.num / pred.denom).toFixed(2)}`
				);
			});
			console.log(`Prediction: ${JSON.stringify(preds)}`);
			if (this.auto_play.length > 0) {
				// Make a "human" play automatically (without enabling GUI play).
				this.determineWinner(this.auto_play.shift());
				this.makePrediction();
			} else {
				// Ready for the next interactive prediction.
				this.ready = true;
			}
		}, 300);
	}

	// Make the given prediction.
	_manufacturedPrediction(index) {
		return [
			{ est: index, num: 1, denom: 3 },
			{ est: (index + 1) % 3, num: 1, denom: 3 },
			{ est: (index + 2) % 3, num: 1, denom: 3 },
		];
	}

	// Predict the human's next play, and, based on that, the AI's next play.
	// Also reflect this in the state and in the DOM.
	makePrediction() {
		// Reflect no-prediction.
		// this.ready = false;
		try {
			if (!this.prediction.predict()) {
			  try {this.predictionCB(
				this._manufacturedPrediction(this.randomHandIndex()),
				null
			  );}
			  catch (e) {
				  console.log('error in makePrediction-PredictionCB call: ', e)
			  }
			}
		  } catch (err) {
			alert("Error in makePrediction(): ", err);
		  }
	}

	/**confusion matrix implementation from https://bci.js.org/docs/metrics_confusionMatrix.js.html */
	confusionMatrix(predictedClasses, actualClasses) {
	//   console.log('cM predictedClasses: ', predictedClasses);
	//   console.log('cM actualClasses: ', actualClasses);
	  predictedClasses = [predictedClasses] 
	  actualClasses = [actualClasses]
	  if (predictedClasses.length > actualClasses.length) {
	    return console.log('predictedClasses length must equal ActualClasses length.');
	  }

	  let largestClass = Math.max(...predictedClasses.concat(actualClasses));

	  //file a 2D
	  let cMatrix = Array(largestClass+1).fill().map(() => Array(largestClass+1).fill(0));

	  for(let i = 0; i < predictedClasses.length; i++) {
	    let predicted = predictedClasses[i];
	    let actual = actualClasses[i];
	    cMatrix[actual][predicted]++;
	  }
	//   console.log('cMatrix: ', cMatrix);
//22 and 20 does not work
	if (cMatrix[0] == 1) {
	  	this.anpn_index++;
	} else if (cMatrix[1][1] == 1) {
	  	this.alpl_index++;
	} else if (cMatrix[0][1] == 1) {
	  	this.anpl_index++;
	} else if (cMatrix[0][2] == 1) {
		this.anph_index++;
	} else if (cMatrix[1][0] == 1) {
		this.alpn_index++;
	} else if (cMatrix[1][2] == 1) {
		this.alph_index++;
	}  else if (cMatrix[2][0] == 1) {
		this.ahpn_index++;
	}  else if (cMatrix[2][1] == 1) {
		this.ahpl_index++;
	} else if (cMatrix[2][2] == 1) {
		this.ahph_index++;
	} 
	  $("#cMatrix-ahph").text(this.ahph_index);
	  $("#cMatrix-ahpl").text(this.ahpl_index);
	  $("#cMatrix-ahpn").text(this.ahpn_index);
	  $("#cMatrix-alpl").text(this.alpl_index);
	  $("#cMatrix-alph").text(this.alph_index);
	  $("#cMatrix-alpn").text(this.alpn_index);
	  $("#cMatrix-anpn").text(this.anpn_index);
	  $("#cMatrix-anph").text(this.anph_index);
	  $("#cMatrix-anpl").text(this.anpl_index);

	  return cMatrix;
	}



}
