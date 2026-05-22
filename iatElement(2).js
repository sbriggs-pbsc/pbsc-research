class QualtricsIAT extends HTMLElement {
	constructor() {
		super();
		this.questionName = '';
		this.iatId = '';
		this.task = null;
 
		this.currentState = 'init';
		this.instructions = [
			'<div>Put your middle or index fingers on the <b>E</b> and <b>I</b> keys of your keyboard. Words or images representing the categories at the top will appear one-by-one in the middle of the screen. When the item belongs to a category on the left, press the <b>E</b> key; when the item belongs to a category on the right, press the <b>I</b> key.  Items belong to only one category.  If you make an error, an <span style="color: red;">X</span> will appear - fix the error by hitting the other key.</div><br><div>This is a timed sorting task. <b>GO AS FAST AS YOU CAN</b> while making as few mistakes as possible. Going too slow or making too many errors will result in an uninterpretable score. This task will take about 5 minutes to complete.</div><br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>',
			'<p><b>See above, the categories have changed.</b>  The items for sorting have changed as well.  The rules, however, are the same.</p><br><p>When the items belong to a category on the left press the <b>E</b> key; when the item belongs to a category on the right, press the <b>I</b> key.  Items belong to only one category.  An <span style="color: red;">X</span> appears after an error - fix the error by hitting the other key.  <b>GO AS FAST AS YOU CAN.</b></p><br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>',
			'<p><b>See above, the four categories you saw separately now appear together.</b> Remember, each item belongs to only one group. For example, if the categories <b>flower</b> and <b>good</b> appeared on separate sides above - pictures or words meaning <b>flower</b> would go in the <b>flower</b> category, not the <b>good</b> category.</p><br><p>The <span style="color: green;">green</span> and <b>black</b> labels and items may help to identify the appropriate category.  Use the <b>E</b> and <b>I</b> keys to categorize items into the four groups <b>left</b> and <b>right</b>, and correct errors by hitting the other key.</p><br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>',
			'<p><b>Sort the same four categories again</b> Remember to go as fast as you can while making as few mistakes as possible.</p><br><p>The <span style="color: green;">green</span> and <b>black</b> labels and items may help to identify the appropriate category.  Use the <b>E</b> and <b>I</b> keys to categorize items into the four groups <b>left</b> and <b>right</b>, and correct errors by hitting the other key.</p><br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>',
			'<p><b>Notice above, there are only two categories and they have switched positions.</b> The concept that was previously on the left is now on the right, and the concept that was on the right is now on the left.  Practice this new configuration.<br>Use the <b>E</b> and <b>I</b> keys to categorize left and right, and correct errors by hitting the other key.<br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>',
			'<p><b>See above, the four categories now appear together in a new configuration.</b> Remember, each item belongs to only one group. </p><br><p>The <span style="color: green;">green</span> and <b>black</b> labels and items may help to identify the appropriate category.  Use the <b>E</b> and <b>I</b> keys to categorize items into the four groups <b>left</b> and <b>right</b>, and correct errors by hitting the other key.</p><br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>',
			'<p><b>Sort the same four categories again</b> Remember to go as fast as you can while making as few mistakes as possible.</p><br><p>The <span style="color: green;">green</span> and <b>black</b> labels and items may help to identify the appropriate category.  Use the <b>E</b> and <b>I</b> keys to categorize items into the four groups <b>left</b> and <b>right</b>, and correct errors by hitting the other key.</p><br><div style="text-align:center">Press the <b>space bar</b> to begin.</div>'
		];
		this.roundTypes = ['target','association','both','both','target','both','both'];
		this.trialCount = [20, 20, 40, 40, 20, 40, 40];
		this.rounds = [];
 
		this.curRound = -1;
		this.curTrial = -1;
 
		this.score = 0;
 
		this.question = null;
		this.qualtrics = null;
 
		// FIX: Track shuffled stimulus decks per category for sampling-without-replacement
		this.stimulusDecks = {};
 
		this.styleElement = document.createElement('style');
		this.styleElement.textContent = `
#instructions {
    width: 800px;
}
 
#experimentFrame {
    margin-left: auto;
    margin-right: auto;
    width:840px;
    height: 600px;
    border: solid black 1px;
}
 
#pictureFrame {
	text-align: center;
}
 
#header {
	height: 120px;
}
 
#leftCat {
	font-size: 1.5em;
	margin: 15px;
	float: left;
	max-width: 220px;
}
 
#rightCat {
	font-size: 1.5em;
	margin: 15px;
	float: right;
	max-width: 220px;
	text-align: right;
}
 
#expInstruct {
    margin: 15px;
}
 
#underInstruct {
    margin-left: auto;
    margin-right: auto;
    margin-top: 10px;
    width: 600px;
}
 
.itemdiv {
	margin-left: auto;
	margin-right: auto;
}
 
#word {
	width: 100px;
	text-align: center;
	font-size: 1.5em;
	margin-left: auto;
	margin-right: auto;
	padding-top: 85px;
}
#wrong {
	margin-left: auto;
	margin-right: auto;
	height: 80px;
	visibility: hidden;
}
		`;
		this.condStyle = document.createElement('style');
 
		this.wrapper = document.createElement('div');
 
		this.shadow = this.attachShadow({mode: 'open'});
		this.shadow.appendChild(this.styleElement);
		this.shadow.appendChild(this.condStyle);
		this.shadow.appendChild(this.wrapper);
	}
 
	// FIX: Fisher-Yates shuffle utility
	shuffle(array) {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}
 
	// FIX: Get next stimulus index for a category without repetition.
	// Uses a shuffled deck; reshuffles when exhausted, ensuring the last
	// item of the old deck isn't the first item of the new deck.
	getNextStimulusIndex(catId) {
		let deck = this.stimulusDecks[catId];
		if (!deck || deck.position >= deck.indices.length) {
			const numStimuli = this.task.categories[catId].stimuli.length;
			const indices = Array.from({length: numStimuli}, (_, i) => i);
			let shuffled = this.shuffle(indices);
			// Avoid repeating the last stimulus from the previous deck
			if (deck && deck.indices.length > 0) {
				const lastUsed = deck.indices[deck.indices.length - 1];
				while (shuffled[0] === lastUsed && numStimuli > 1) {
					shuffled = this.shuffle(indices);
				}
			}
			this.stimulusDecks[catId] = { indices: shuffled, position: 0 };
			deck = this.stimulusDecks[catId];
		}
		return deck.indices[deck.position++];
	}
 
	connectedCallback() {
		this.iatId = this.getAttribute('iat-id');
		this.questionName = this.getAttribute('question-name');
		this.pathRoot = this.getAttribute('path-root') || '';
		this.showResult = false;
		if (this.hasAttribute('show-result') && this.getAttribute('show-result') === 'true') {
			this.showResult = true;
		}
 
		this.spinnerImage = document.createElement('img');
		if (this.pathRoot) {
			this.spinnerImage.src = this.pathRoot + 'images/iat/spinner.gif';
		}
 
		// FIX: If a task definition has been injected directly (self-contained mode),
		// skip the server fetch entirely and proceed straight to setup.
		if (this._injectedTask) {
			this.task = this._injectedTask;
			if (this.question) {
				this.question.hideNextButton();
			}
			const self = this; setTimeout(function() { self.finishSetup(); }, 0);
			return;
		}
 
		const iatFetch = fetch(this.pathRoot + 'iat/taskDefinition-' + this.iatId + '.json', {method: 'GET', mode: 'cors'});
		iatFetch.then((response) => {
			const iatJSON = response.json();
			iatJSON.then((task) => {
				if (task.error) {
					this.errorDisplay = document.createElement('div');
					this.errorDisplay.style.color = 'red';
					this.errorDisplay.style.fontWeight = 'bold';
					this.errorDisplay.innerHTML = task.error;
					this.wrapper.appendChild(this.errorDisplay);
					return;
				}
				this.task = task;
 
				const self = this; setTimeout(function() { self.finishSetup(); }, 0);
			});
		});
 
		if (this.question) {
			this.question.hideNextButton();
		}
	}
 
	finishSetup() {
		this.experimentFrame = document.createElement('div');
		this.experimentFrame.id = 'experimentFrame';
		
		this.header = document.createElement('div');
		this.header.id = 'header';
		
		this.headerLeftCat = document.createElement('div');
		this.headerLeftCat.id = 'leftCat';
		this.header.appendChild(this.headerLeftCat);
 
		this.headerRightCat = document.createElement('div');
		this.headerRightCat.id = 'rightCat';
		this.header.appendChild(this.headerRightCat);
 
		this.experimentFrame.appendChild(this.header);
 
		this.pictureFrame = document.createElement('div');
		this.pictureFrame.id = 'pictureFrame';
 
		this.expInstruct = document.createElement('div');
		this.expInstruct.id = 'expInstruct';
		this.expInstruct.style.textAlign = 'center';
		this.pictureFrame.appendChild(this.expInstruct);
		
		this.word = document.createElement('div');
		this.word.id = 'word';
		this.expInstruct.appendChild(this.word);
 
		this.wrong = document.createElement('img');
		this.wrong.id = 'wrong';
		this.wrong.src = this.pathRoot + 'images/iat/Wrong.jpg';  // FIX: use pathRoot instead of hardcoded URL
		this.pictureFrame.appendChild(this.wrong);
 
		this.experimentFrame.appendChild(this.pictureFrame);
 
		this.wrapper.appendChild(this.experimentFrame);
 
		this.underInstruct = document.createElement('div');
		this.underInstruct.id = 'underInstruct';
		this.underInstruct.innerHTML = `If the <b>E</b> and <b>I</b> keys do not work, click the mouse inside the white box and try again.<br>
	If the red <span style="color: red">X</span> appears, press the other key to make the red <span style="color: red">X</span> go away.`;
		this.wrapper.appendChild(this.underInstruct);
 
		this.errorDisplay = document.createElement('div');
		this.errorDisplay.id = 'error';
		this.errorDisplay.style.color = 'red';
		this.wrapper.appendChild(this.errorDisplay);
 
		this.successDisplay = document.createElement('div');
		this.successDisplay.id = 'success';
		this.successDisplay.style.color = 'green';
		this.successDisplay.style.display = 'none';
		this.wrapper.appendChild(this.successDisplay);
 
		// NOTE: Stimulus padding removed. The shuffle-and-cycle approach handles
		// pools of any size naturally — no need to equalize array lengths.
 
		this.categoryImages = {};
		for (const cat of Object.keys(this.task.categories)) {
			const category = this.task.categories[cat];
			this.categoryImages[cat] = [];
			if (category.type === 'img') {
				for (let i = 0; i < category.stimuli.length; i++) {
					const stimImg = document.createElement('img');
					stimImg.src = category.stimuli[i];
					this.categoryImages[cat].push(stimImg);
				}
			}
		}
 
		this.setupRounds();
 
		this.startIAT();
	}
 
	setupRounds() {
		// Reset stimulus decks for fresh shuffle-and-cycle
		this.stimulusDecks = {};
 
		for (let i = 0; i < this.roundTypes.length; i++) {
			this.rounds[i] = [];
 
			// FIX: Pre-build balanced category assignments, then shuffle.
			// This ensures equal representation of each category within a round.
			const categoryAssignments = [];
			const trialCount = this.trialCount[i];
 
			switch (this.roundTypes[i]) {
				case 'target':
					// Half A, half B
					for (let t = 0; t < trialCount; t++) {
						categoryAssignments.push(t < trialCount / 2 ? 'A' : 'B');
					}
					break;
				case 'association':
					// Half 1, half 2
					for (let t = 0; t < trialCount; t++) {
						categoryAssignments.push(t < trialCount / 2 ? '1' : '2');
					}
					break;
				case 'both':
					// Alternate target/association trials, balanced within each
					// Even indices: target (half A, half B)
					// Odd indices: association (half 1, half 2)
					{
						const targetSlots = trialCount / 2;
						const assocSlots = trialCount / 2;
						const targets = [];
						const assocs = [];
						for (let t = 0; t < targetSlots; t++) {
							targets.push(t < targetSlots / 2 ? 'A' : 'B');
						}
						for (let t = 0; t < assocSlots; t++) {
							assocs.push(t < assocSlots / 2 ? '1' : '2');
						}
						// Shuffle each group independently
						const shuffledTargets = this.shuffle(targets);
						const shuffledAssocs = this.shuffle(assocs);
						// Interleave: even = target, odd = association
						let ti = 0, ai = 0;
						for (let t = 0; t < trialCount; t++) {
							if (t % 2 === 0) {
								categoryAssignments.push(shuffledTargets[ti++]);
							} else {
								categoryAssignments.push(shuffledAssocs[ai++]);
							}
						}
					}
					break;
			}
 
			// For target and association rounds, shuffle the balanced assignments
			if (this.roundTypes[i] !== 'both') {
				const shuffled = this.shuffle(categoryAssignments);
				categoryAssignments.length = 0;
				categoryAssignments.push(...shuffled);
			}
 
			// Reset decks at the start of each round for clean cycling
			this.stimulusDecks = {};
 
			for (let j = 0; j < trialCount; j++) {
				const round = {};
				round.startTime = 0;
				round.endTime = 0;
				round.itemType = 'none';
				round.category = 'none';
				round.catId = 'X';
				round.catIndex = 0;
				round.correct = 0;
				round.errors = 0;
 
				const catId = categoryAssignments[j];
				round.catId = catId;
				round.category = this.task.categories[catId].label;
				round.itemType = this.task.categories[catId].type;
 
				// Determine correct key based on round and category
				switch (catId) {
					case 'A':
						round.correct = (i < 4) ? 1 : 2;
						break;
					case 'B':
						round.correct = (i < 4) ? 2 : 1;
						break;
					case '1':
						round.correct = 1;
						break;
					case '2':
						round.correct = 2;
						break;
				}
 
				// FIX: Use shuffle-and-cycle instead of random-with-retry
				round.catIndex = this.getNextStimulusIndex(catId);
 
				this.rounds[i].push(round);
			}
		}
	}
 
	startIAT() {
		this.curRound = 0;
		this.curTrial = 0;
 
		// Make the target or association words green
		if (Math.random() < 0.5) {
			this.condStyle.textContent = `.catA { color: green; }`;
		} else {
			this.condStyle.textContent = `.cat1 { color: green; }`;
		}
 
		const root = this;
		// FIX: Use addEventListener instead of overwriting document.onkeyup
		this._keyHandler = function(event) { root.processInput(event); };
		document.addEventListener('keyup', this._keyHandler);
		this.currentState = 'instruction';
		this.instructionPage();
	}
 
	// Insert instruction text based on stage in IAT
	instructionPage() {	
		switch (this.curRound) {
			case 0:
				this.headerLeftCat.innerHTML = this.task.categories['A'].label;
				this.headerLeftCat.classList.add('catA');
				this.headerRightCat.innerHTML = this.task.categories['B'].label;
				this.headerRightCat.classList.add('catA');
				break;
			case 1:
				this.headerLeftCat.innerHTML = this.task.categories['1'].label;
				this.headerLeftCat.classList.remove('catA');
				this.headerLeftCat.classList.add('cat1');
				this.headerRightCat.innerHTML = this.task.categories['2'].label;
				this.headerRightCat.classList.remove('catA');
				this.headerRightCat.classList.add('cat1');
				break;
			case 2:
			case 3:
				this.headerLeftCat.classList.remove('cat1');
				this.headerLeftCat.innerHTML = '<span class="catA">' + this.task.categories['A'].label + '</span><br>or<br><span class="cat1">' + this.task.categories['1'].label + '</span>';
				this.headerRightCat.classList.remove('cat1');
				this.headerRightCat.innerHTML = '<span class="catA">' + this.task.categories['B'].label + '</span><br>or<br><span class="cat1">' + this.task.categories['2'].label + '</span>';
				break;
			case 4:
				this.headerLeftCat.innerHTML = this.task.categories['B'].label;
				this.headerLeftCat.classList.add('catA');
				this.headerRightCat.innerHTML = this.task.categories['A'].label;
				this.headerRightCat.classList.add('catA');
				break;
			case 5:
			case 6:
				this.headerLeftCat.classList.remove('catA');
				this.headerLeftCat.innerHTML = '<span class="catA">' + this.task.categories['B'].label + '</span><br>or<br><span class="cat1">' + this.task.categories['1'].label + '</span>';
				this.headerRightCat.classList.remove('catA');
				this.headerRightCat.innerHTML = '<span class="catA">' + this.task.categories['A'].label + '</span><br>or<br><span class="cat1">' + this.task.categories['2'].label + '</span>';
				break;
		}
		if (this.curRound === 7) {
			this.headerLeftCat.innerHTML = '';
			this.headerRightCat.innerHTML = '';
			this.expInstruct.appendChild(this.spinnerImage);
			const result = this.calculateIAT();
			
			if (this.showResult) {
				this.displayResult(result);
			} else {
				this.pictureFrame.innerHTML = "<div style='text-align:center;padding:20px'>Thanks for participating!</div>";
			}
 
			if (this.qualtrics) {
				this.qualtrics.setJSEmbeddedData('IATResult', result);
			}
			if (this.question) {
				this.question.showNextButton();
			}
 
			// FIX: Clean up event listener when done
			document.removeEventListener('keyup', this._keyHandler);
		} else {
			this.expInstruct.innerHTML = this.instructions[this.curRound];
		}
	}
 
	// Get the stimulus for this round & trial and display it
	displayItem() {
		const trial = this.rounds[this.curRound][this.curTrial];
		// FIX: Use performance.now() for sub-millisecond RT precision
		trial.startTime = performance.now();
		this.expInstruct.innerHTML = '';
		if (trial.itemType === "img") {
			this.expInstruct.appendChild(this.categoryImages[trial.catId][trial.catIndex]);
		} else if (trial.itemType === "txt") {
			this.word.textContent = this.task.categories[trial.catId].stimuli[trial.catIndex];
			this.expInstruct.appendChild(this.word);
			if (trial.catId === 'A' || trial.catId === 'B') {
				this.word.classList.remove('cat1');
				this.word.classList.add('catA');
			} else {
				this.word.classList.remove('catA');
				this.word.classList.add('cat1');
			}
		}
	}
 
	processInput(kEvent) {
		const unicode = kEvent.keyCode ? kEvent.keyCode : kEvent.charCode;
		if (this.currentState === 'instruction' && unicode === 32) {
			this.currentState = 'play';
			this.expInstruct.innerHTML = '';
			this.displayItem();
			kEvent.preventDefault();
			return;
		} else if (this.currentState === 'play') {
			const keyE = (unicode === 69 || unicode === 101);
			const keyI = (unicode === 73 || unicode === 105);
			const rCorrect = this.rounds[this.curRound][this.curTrial].correct;
			
			if ((rCorrect === 1 && keyE) || (rCorrect === 2 && keyI)) {
				this.wrong.style.visibility = 'hidden';
				// FIX: Use performance.now() to match startTime
				this.rounds[this.curRound][this.curTrial].endTime = performance.now();
				if (this.curTrial < this.rounds[this.curRound].length - 1) {
					this.curTrial++;
					this.displayItem();
				} else {
					if (this.word.parentElement === this.expInstruct) {
						this.expInstruct.removeChild(this.word);
					}
					this.currentState = "instruction";
					this.curRound++;
					this.curTrial = 0;
					this.instructionPage();
				}
			} else if ((rCorrect === 1 && keyI) || (rCorrect === 2 && keyE)) {
				this.wrong.style.visibility = 'visible';
				this.rounds[this.curRound][this.curTrial].errors++;
			}
		}
	}
 
	calculateIAT() {
		// NOTE: This scoring formula was inherited from a previous version.
		// It computes a t-like statistic on log-transformed RTs, which differs
		// from the standard Greenwald et al. (2003) D-score algorithm.
		// The D-score uses: (mean_incompatible - mean_compatible) / pooled_SD
		// where pooled_SD is computed over all trials in both critical blocks.
		// Consider switching to the D-score for comparability with published research.
		// The current formula is preserved here to maintain continuity with existing data.
 
		const n = this.rounds[3].length - 1; // trials used (skipping first)
 
		// Calculate mean log(RT) for compatible block (round 4)
		let compatible = 0;
		for (let i = 1; i < this.rounds[3].length; i++) {
			const rt = Math.min(3000, Math.max(300, this.rounds[3][i].endTime - this.rounds[3][i].startTime));
			compatible += Math.log(rt);
		}
		compatible /= n;
		
		// Calculate mean log(RT) for incompatible block (round 7)
		let incompatible = 0;
		for (let i = 1; i < this.rounds[6].length; i++) {
			const rt = Math.min(3000, Math.max(300, this.rounds[6][i].endTime - this.rounds[6][i].startTime));
			incompatible += Math.log(rt);
		}
		incompatible /= n;
		
		// Calculate variance log(RT) for compatible block
		let cvar = 0;
		for (let i = 1; i < this.rounds[3].length; i++) {
			const rt = Math.min(3000, Math.max(300, this.rounds[3][i].endTime - this.rounds[3][i].startTime));
			cvar += Math.pow((Math.log(rt) - compatible), 2);
		}
		
		// Calculate variance log(RT) for incompatible block
		let ivar = 0;
		for (let i = 1; i < this.rounds[6].length; i++) {
			const rt = Math.min(3000, Math.max(300, this.rounds[6][i].endTime - this.rounds[6][i].startTime));
			ivar += Math.pow((Math.log(rt) - incompatible), 2);
		}
		
		// Calculate t-value (see NOTE above about D-score alternative)
		const tvalue = (incompatible - compatible) / Math.sqrt(((cvar / (n)) + (ivar / (n))) / (n + 1));
		
		return tvalue;
	}
 
	displayResult(tvalue) {
		let severity = '';
		if (Math.abs(tvalue) > 2.89) { 
			severity = " <b>much more</b> than "; 
		} else if (Math.abs(tvalue) > 2.64) { 
			severity = " <b>more</b> than "; 
		} else if (Math.abs(tvalue) > 1.99) { 
			severity = " <b>a little more</b> than ";
		} else if (Math.abs(tvalue) > 1.66) {
			severity = " <b>just slightly more</b> than ";
		} else { 
			severity = '';
		}
		
		let resultText = '';
		if (tvalue < 0 && severity !== "") { 
			resultText = '<div style="text-align:center;padding:20px">You associate <span class="catA">' + this.task.categories['B'].label + '</span> with <span class="cat1">' + this.task.categories['1'].label + '</span>';
			resultText += ' and <span class="catA">' + this.task.categories['A'].label + '</span> with <span class="cat1">' + this.task.categories['2'].label + '</span>' + severity;
			resultText += 'you associate <span class="catA">' + this.task.categories['A'].label + '</span> with <span class="cat1">' + this.task.categories['1'].label;
			resultText += '</span> and <span class="catA">' + this.task.categories['B'].label + '</span> with <span class="cat1">' + this.task.categories['2'].label + '</span>.</div>';
		} else if (tvalue > 0 && severity !== '') {
			resultText = '<div style="text-align:center;padding:20px">You associate <span class="catA">' + this.task.categories['A'].label + '</span> with <span class="cat1">' + this.task.categories['1'].label + '</span>';
			resultText += ' and <span class="catA">' + this.task.categories['B'].label + '</span> with <span class="cat1">' + this.task.categories['2'].label + '</span>' + severity;
			resultText += 'you associate <span class="catA">' + this.task.categories['B'].label + '</span> with <span class="cat1">' + this.task.categories['1'].label;
			resultText += '</span> and <span class="catA">' + this.task.categories['A'].label + '</span> with <span class="cat1">' + this.task.categories['2'].label + '</span>.</div>';
		} else {
			resultText = '<div style="text-align:center;padding:20px">You do not associate <span class="catA">' + this.task.categories['A'].label;
			resultText += '</span> with <span class="cat1">' + this.task.categories['1'].label + '</span> any more or less than you associate <span class="catA">';
			resultText += this.task.categories['B'].label + '</span> with <span class="cat1">' + this.task.categories['1'].label + '</span>.</div>';
		}
		this.pictureFrame.innerHTML = resultText;
	}
 
	setQualtricsQuestion(question) {
		this.question = question;
	}
	setQualtricsEngine(engine) {
		this.qualtrics = engine;
	}
}
 
customElements.define('qualtrics-iat', QualtricsIAT);
 
