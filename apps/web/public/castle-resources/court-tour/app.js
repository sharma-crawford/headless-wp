const scenes = {
  orientation: {
    kicker: "Scene 1 of 3",
    title: "Inside the courtroom",
    instruction: "Select a numbered point to examine the room.",
    caption: "Representative orientation view",
    image: "/castle-resources/court-tour/assets/courtroom-wide.jpg",
    alt: "Illustrated immigration courtroom viewed from the gallery, with a judge at the bench, two counsel tables, a detained respondent appearing on a video monitor, and family members observing.",
    ratio: "2.598 / 1",
    points: [
      { x: 42, y: 24, type: "Role", title: "Immigration Judge", summary: "The Immigration Judge presides over the proceeding, develops the record, rules on motions and objections, and decides removability and eligibility for relief.", practice: "Direct statements and argument to the judge. Listen closely for rulings, deadlines, and instructions that must be preserved in the record.", position: "Center bench", focus: "The record" },
      { x: 16, y: 26, type: "Participant", title: "Detained Respondent", summary: "The respondent appears by video from an immigration detention facility rather than sitting in the courtroom with counsel.", practice: "Confirm that your client can see, hear, understand the interpretation, review exhibits, and communicate confidentially with counsel. Raise technology or access problems promptly and on the record.", position: "Video monitor", focus: "Meaningful participation" },
      { x: 22, y: 47, type: "Role", title: "Respondent’s Counsel", summary: "Counsel advocates for the respondent, presents evidence, examines witnesses, makes objections, and preserves issues for review.", practice: "Before the hearing begins, determine how confidential communication with a detained client will work and how the client will view documents introduced during the proceeding.", position: "Counsel table", focus: "Client advocacy" },
      { x: 58, y: 47, type: "Role", title: "DHS Counsel", summary: "The Department of Homeland Security appears as a party and is generally represented by an attorney from U.S. Immigration and Customs Enforcement.", practice: "Know the government’s theory, exhibits, witnesses, and anticipated objections. Keep exchanges professional and direct argument through the judge.", position: "Opposing table", focus: "Government’s position" },
      { x: 51, y: 75, type: "Technology", title: "Microphones & Official Record", summary: "Immigration hearings are electronically recorded. The recording becomes a critical part of the Record of Proceedings and any later review.", practice: "Speak clearly, avoid talking over another participant, identify exhibits precisely, and make objections and rulings audible. If something important occurred off the record, request that it be summarized on the record.", position: "Each table and bench", focus: "Clear audio record" },
      { x: 82, y: 60, type: "Space", title: "Gallery", summary: "Family members, supporters, and permitted observers sit behind the railing. Some proceedings may be closed or access may be limited.", practice: "Prepare supporters for security, courtroom decorum, waiting time, and the possibility that a witness may need to remain outside until called.", position: "Rear seating", focus: "Observers and support" },
      { x: 67, y: 27, type: "Space", title: "Witness Position", summary: "Witnesses testify under oath and may be questioned by the parties and the Immigration Judge. The precise location varies by courtroom.", practice: "Orient each witness before the hearing: where to sit, how to use the microphone, when to pause for interpretation, and how to answer only the question asked.", position: "Near the judge", focus: "Testimony" },
      { x: 51, y: 50, type: "Boundary", title: "The Courtroom Rail", summary: "The rail separates the well of the courtroom—where the judge, parties, and witnesses participate—from public seating.", practice: "Do not assume family members or support persons may enter the well. Ask court staff before moving people, documents, or equipment across this boundary.", position: "Across the courtroom", focus: "Controlled access" }
    ]
  },
  hearing: {
    kicker: "Scene 2 of 3",
    title: "Making the record",
    instruction: "Focus on advocacy, evidence, and courtroom mechanics.",
    caption: "Individual hearing detail",
    image: "/castle-resources/court-tour/assets/hearing-close.jpg",
    alt: "Closer illustrated view of an immigration hearing with the judge in the foreground, counsel at opposing tables, documents and microphones, and family members seated in the gallery.",
    ratio: "1.286 / 1",
    points: [
      { x: 49, y: 83, type: "Role", title: "The Judge on the Record", summary: "The judge controls the order of the hearing, asks questions, rules on objections, and may issue an oral or written decision.", practice: "If a ruling or instruction is unclear, respectfully seek clarification before moving on. Confirm deadlines and any waivers before the hearing concludes.", position: "Foreground bench", focus: "Rulings and findings" },
      { x: 22, y: 48, type: "Advocacy", title: "Respondent’s Case", summary: "Respondent’s counsel uses testimony, exhibits, legal authority, and argument to meet the applicable burden and establish eligibility for relief or protection.", practice: "Build a clear evidentiary sequence. Connect each witness and exhibit to an element, and identify corroboration or explain why it is unavailable.", position: "Counsel table", focus: "Elements and proof" },
      { x: 74, y: 49, type: "Advocacy", title: "DHS Presentation", summary: "DHS counsel may offer evidence, examine witnesses, object, and argue the government’s position on removability and relief.", practice: "Listen for factual concessions, evidentiary gaps, and shifting theories. State the legal and factual basis for an objection concisely.", position: "Opposing table", focus: "Charges and opposition" },
      { x: 37, y: 56, type: "Evidence", title: "Exhibits & Filings", summary: "Applications, declarations, identity documents, records, expert materials, and other exhibits become part of the Record of Proceedings when properly filed and admitted.", practice: "Use a reliable exhibit index. Verify pagination, translations, proof of service, filing deadlines, and whether the judge has admitted—not merely received—each item.", position: "On counsel table", focus: "Admission and organization" },
      { x: 12, y: 52, type: "Technology", title: "Table Microphone", summary: "Every answer, objection, ruling, and oral argument must be captured clearly for the official recording.", practice: "Wait until the prior speaker finishes. Keep papers away from the microphone, state names for the record, and ask remote participants to confirm audio quality.", position: "At each speaking position", focus: "Audibility" },
      { x: 52, y: 67, type: "Technology", title: "Courtroom Monitor", summary: "Courtroom monitors may display remote participants, interpretation connections, or other authorized hearing technology.", practice: "Test access early when possible. Identify delays, frozen video, dropped audio, or an inability to see exhibits immediately and request an appropriate remedy.", position: "Courtroom well", focus: "Remote access" },
      { x: 45, y: 33, type: "People", title: "Family & Support", summary: "The proceeding reaches beyond the people seated at counsel tables. Family members may observe, provide evidence, or testify when permitted.", practice: "Explain likely procedure, confidentiality limits, and courtroom behavior in advance. Separate emotional support from witness preparation and avoid discussing testimony among sequestered witnesses.", position: "Gallery", focus: "Preparation and support" }
    ]
  },
  after: {
    kicker: "Scene 3 of 3",
    title: "After the hearing",
    instruction: "A hearing may end with a decision—or another deadline.",
    caption: "Post-hearing conference",
    image: "/castle-resources/court-tour/assets/after-hearing.jpg",
    alt: "Illustrated courtroom after a hearing, with counsel speaking closely with a parent and child while the judge remains at the bench.",
    ratio: "1.286 / 1",
    points: [
      { x: 49, y: 38, type: "Client Care", title: "Immediate Client Conference", summary: "After the hearing, counsel should explain what occurred, what the judge decided or reserved, and what the client must do next.", practice: "Use an interpreter when needed. Do not assume relief or next steps were understood during a stressful hearing—review them in plain, precise terms.", position: "Outside the well", focus: "Understanding" },
      { x: 22, y: 22, type: "Decision", title: "Oral Decision", summary: "The judge may issue an oral decision at the conclusion of the hearing or reserve the matter for a later written decision.", practice: "Listen for findings, the disposition of every application, appeal rights, and whether either party waives or reserves appeal. Correct material misunderstandings on the record when appropriate.", position: "Judge’s bench", focus: "Disposition and appeal" },
      { x: 44, y: 55, type: "Deadline", title: "Preserve Next Steps", summary: "The end of the hearing may trigger appeal, briefing, biometrics, filing, or other compliance deadlines.", practice: "Calendar every deadline before leaving. Secure the decision or hearing notice, confirm the client’s current contact information, and document responsibility for each next step.", position: "Counsel’s checklist", focus: "No missed deadlines" },
      { x: 55, y: 47, type: "People", title: "The Human Result", summary: "Whatever the outcome, the client and family may be processing fear, relief, uncertainty, or several emotions at once.", practice: "Create enough space for questions. Give concrete instructions, identify what remains uncertain, and connect the family with appropriate legal or community support when needed.", position: "Client and family", focus: "Dignity and clarity" }
    ]
  }
};

const els = {
  frame: document.querySelector("#image-frame"),
  image: document.querySelector("#scene-image"),
  layer: document.querySelector("#hotspot-layer"),
  kicker: document.querySelector("#scene-kicker"),
  title: document.querySelector("#scene-title"),
  instruction: document.querySelector("#scene-instruction"),
  caption: document.querySelector("#scene-caption"),
  number: document.querySelector("#detail-number"),
  type: document.querySelector("#detail-type"),
  detailTitle: document.querySelector("#detail-title"),
  summary: document.querySelector("#detail-summary"),
  practice: document.querySelector("#detail-practice"),
  position: document.querySelector("#detail-position"),
  focus: document.querySelector("#detail-focus"),
  previous: document.querySelector("#previous-point"),
  next: document.querySelector("#next-point")
};

let activeScene = "orientation";
let activePoint = 0;

function renderScene(sceneName, pointIndex = 0) {
  activeScene = sceneName;
  activePoint = pointIndex;
  const scene = scenes[sceneName];

  document.querySelectorAll(".scene-tab").forEach((tab) => {
    const isActive = tab.dataset.scene === sceneName;
    tab.classList.toggle("is-active", isActive);
    if (isActive) tab.setAttribute("aria-current", "step");
    else tab.removeAttribute("aria-current");
  });

  els.frame.classList.add("is-changing");
  els.image.src = scene.image;
  els.image.alt = scene.alt;
  els.frame.style.aspectRatio = scene.ratio;
  els.kicker.textContent = scene.kicker;
  els.title.textContent = scene.title;
  els.instruction.textContent = scene.instruction;
  els.caption.textContent = scene.caption;

  els.layer.replaceChildren();
  scene.points.forEach((point, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hotspot" + (index === activePoint ? " is-active" : "");
    button.style.left = `${point.x}%`;
    button.style.top = `${point.y}%`;
    button.textContent = String(index + 1).padStart(2, "0");
    button.setAttribute("aria-label", `${index + 1}. ${point.title}`);
    button.addEventListener("click", () => renderPoint(index, true));
    els.layer.append(button);
  });

  requestAnimationFrame(() => els.frame.classList.remove("is-changing"));
  renderPoint(pointIndex, false);
}

function renderPoint(index, moveFocus) {
  const points = scenes[activeScene].points;
  activePoint = (index + points.length) % points.length;
  const point = points[activePoint];

  els.number.textContent = String(activePoint + 1).padStart(2, "0");
  els.type.textContent = point.type;
  els.detailTitle.textContent = point.title;
  els.summary.textContent = point.summary;
  els.practice.textContent = point.practice;
  els.position.textContent = point.position;
  els.focus.textContent = point.focus;

  const buttons = els.layer.querySelectorAll(".hotspot");
  buttons.forEach((button, i) => button.classList.toggle("is-active", i === activePoint));
  if (moveFocus && window.matchMedia("(max-width: 900px)").matches) {
    document.querySelector(".detail-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.querySelectorAll(".scene-tab").forEach((tab) => {
  tab.addEventListener("click", () => renderScene(tab.dataset.scene));
});

els.previous.addEventListener("click", () => renderPoint(activePoint - 1, false));
els.next.addEventListener("click", () => {
  const points = scenes[activeScene].points;
  if (activePoint < points.length - 1) renderPoint(activePoint + 1, false);
  else {
    const order = Object.keys(scenes);
    const nextScene = order[(order.indexOf(activeScene) + 1) % order.length];
    renderScene(nextScene);
    document.querySelector(".tour-shell").scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

const dialog = document.querySelector("#about-dialog");
document.querySelector("[data-open-about]").addEventListener("click", () => dialog.showModal());
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close();
});

renderScene(activeScene);

document.querySelector('#share-tour').addEventListener('click',async()=>{const status=document.querySelector('#share-status');try{await navigator.clipboard.writeText('https://legal-renaissance.com/immigration-court-tour');status.textContent=' Tour link copied.';}catch{status.textContent=' Share: https://legal-renaissance.com/immigration-court-tour';}});
