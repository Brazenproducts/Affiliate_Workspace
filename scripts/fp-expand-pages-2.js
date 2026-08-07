#!/usr/bin/env node
/**
 * Faithful Passages — Page Content Expander BATCH 2
 * Remaining prayers, scripture pages, and song pages
 */

'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_DIR = path.join(__dirname, '../sites/faithfulpassages.com');
const SITE_URL = 'https://faithfulpassages.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

const EXPANSIONS = [

  // ── PRAYERS ──────────────────────────────────────────────────────────────

  {
    file: 'prayer-for-exhausted-caregiver-2026-07-06.html',
    scripture: {
      heading: 'Scripture for the Exhausted Caregiver',
      verses: [
        { ref: 'Matthew 11:28', text: '"Come to me, all you who are weary and burdened, and I will give you rest."', explanation: 'Jesus speaks directly to exhaustion — not to those who have it together, but to those who are burdened and weary. The caregiver running on empty is exactly the person this invitation is for.' },
        { ref: 'Isaiah 40:29', text: '"He gives strength to the weary and increases the power of the weak."', explanation: 'Strength here is not the absence of tiredness. It is power infused into weakness. God does not always remove the burden; He sometimes strengthens you underneath it.' },
        { ref: 'Galatians 6:9', text: '"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."', explanation: 'Paul acknowledges the reality: caregiving and service can make you weary. His answer is not "try harder" but "hold on — the harvest is coming." The work is not invisible, and it is not without return.' },
      ]
    },
    reflection: `<p>The exhaustion of caregiving is different from ordinary tiredness. It lives in your bones, in the back of your eyes, in the way a night of sleep no longer fully restores you. It is cumulative — built up over months or years of putting someone else's needs first, waking in the night, carrying worry you cannot put down even when you are technically "off." And often it arrives with its own peculiar guilt: you are tired of something that love requires, and that seems like a failing.</p>
<p>It is not. Jesus himself rested. He withdrew from crowds. He slept through a storm so heavy that the boat was nearly swamped. The disciples had to wake Him. Rest was not laziness for Jesus — it was preparation, sustainability, the acknowledgment of physical limits He chose to take on as part of full humanity. To need rest is not to be faithless. It is to be human.</p>
<p>Elijah, after his greatest victory over the prophets of Baal, immediately collapsed in exhaustion and asked to die. God's response is remarkable for what it is not: no rebuke, no reminder of how much work was left to do, no encouragement speech. Just sleep. Then food. Then sleep again. "The journey is too much for you," the angel says gently. That is not weakness. That is diagnosis. If your journey has become too much for you, God already knows, and He is not disappointed in you for it.</p>
<p>You cannot pour from an empty vessel. The care you give — to a parent, a spouse, a child with special needs, a friend in a long illness — matters enormously. But it requires a caregiver who is not depleted to nothing. Receiving care for yourself, asking for help, stepping back temporarily when you must — these are not failures of love. They are the way love sustains itself for the long road.</p>`,
    faqs: [
      { q: 'What does the Bible say about rest?', a: 'Rest is built into creation itself — God rested on the seventh day and declared it holy (Genesis 2:2-3). Jesus regularly withdrew from ministry to pray and rest (Mark 1:35, Luke 5:16). The Sabbath commandment was given not just as a rule but as a gift: you are not a machine, and you are not required to run without stopping. Rest is obedience, not laziness.' },
      { q: 'Is it selfish to take a break from caregiving?', a: 'No. Taking necessary breaks is what allows caregiving to continue. A caregiver who burns out cannot care for anyone. Asking for respite care, taking time to sleep and recover, maintaining your own health — these preserve the caregiving relationship. Loving someone well for the long term requires caring for yourself enough to still be there.' },
      { q: 'How do I pray when I\'m too exhausted to have devotions?', a: 'Breathe. Seriously — short prayers breathed through the day often sustain more than long devotions that become another item on an impossible list. "Help me." "Thank you." "I can\'t do this alone." These are complete prayers. God is not counting your minutes. He is meeting you wherever you actually are.' },
      { q: 'What support does God offer caregivers?', a: 'Scripture promises presence (Isaiah 41:10), strength for the weak (Isaiah 40:29), rest for the burdened (Matthew 11:28), and a community meant to bear one another\'s burdens (Galatians 6:2). Practically, God often works through people — a friend who offers to sit with your loved one, a church that provides meals. Accepting that help is receiving from God, not admitting defeat.' },
    ],
    related: [
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'prayer-for-exhausted-caregiver-2026-08-06.html', title: 'A Prayer for the Exhausted Caregiver (Aug)' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'prayer-for-infertile-heart-2026-07-09.html',
    scripture: {
      heading: 'Scripture for the Longing Heart',
      verses: [
        { ref: '1 Samuel 1:10-11', text: '"In her deep anguish Hannah prayed to the Lord, weeping bitterly."', explanation: 'Hannah did not compose herself before praying. She brought her anguish — loud, raw, and visible enough that the priest thought she was drunk. God received it. He always receives the unpolished cry.' },
        { ref: 'Psalm 113:9', text: '"He settles the childless woman in her home as a happy mother of children."', explanation: 'This verse holds a promise without a timeline. God sees the empty arms. He is not indifferent to the longing.' },
        { ref: 'Romans 8:26', text: '"The Spirit himself intercedes for us through wordless groans."', explanation: 'When the longing is too deep for words — when you have prayed the same prayer so many times it has worn down to a feeling — the Spirit takes over. You do not have to find the words. The groaning is heard.' },
      ]
    },
    reflection: `<p>The longing for a child is one of the most primal human experiences, and the grief of that longing unfulfilled is one of the most isolating. It arrives in waves — at baby showers, at Mother's Day, at the sight of a stroller in a grocery store — and it never fully announces itself, so you cannot always prepare. You can be completely fine and then suddenly not fine at all.</p>
<p>The Bible holds this grief with unusual honesty. Hannah, Rachel, Sarah, Elizabeth — the women whose longing for children is recorded in Scripture are not minor characters. They are central figures in the story of God's people. And in each case, their grief is described without flinching: Hannah wept bitterly, Rachel told Jacob "give me children or I'll die," Sarah laughed a laugh that held decades of pain. God did not rebuke any of them for the intensity of their longing. He met them in it.</p>
<p>Whether you are in the middle of fertility treatments, waiting to adopt, grieving a miscarriage, or simply carrying the ache of a hope deferred — this prayer is for that in-between place where you do not know yet how the story ends. That uncertainty is one of the hardest places to live. Faith does not require pretending the uncertainty is not painful. It requires showing up honestly to the God who already knows.</p>
<p>There are no easy answers in this territory. Proverbs 13:12 says "hope deferred makes the heart sick." That is in the Bible. God acknowledged it. Your heartache is not a lack of faith; it is the honest cost of hoping for something that matters deeply to you. Bring it exactly as it is.</p>`,
    faqs: [
      { q: 'How do I pray when I\'ve been waiting for a child for years?', a: 'Keep praying, even when it feels repetitive or hopeless. Hannah prayed year after year. The Psalms are full of prayers that revisit the same need over and over. God does not tire of your persistence; Jesus specifically praised it (Luke 18:1-8). But also allow yourself to grieve in the prayer, not just ask. God can hold both.' },
      { q: 'Is infertility a punishment from God?', a: 'No. This is a harmful misreading of Scripture. Infertility in the Bible is never presented as divine punishment — it is presented as pain that God sees and, in multiple cases, intervenes in. Jesus directly rejected the idea that suffering equals sin in John 9:3. Your infertility is not a verdict on your faithfulness.' },
      { q: 'What does the Bible say about adoption?', a: 'Adoption is woven into the heart of the gospel itself — Paul describes believers as "adopted" into God\'s family (Romans 8:15, Ephesians 1:5). The Bible consistently honors the care of children without biological parents (James 1:27). Adoption is not a consolation prize; it is one of the most gospel-shaped ways to build a family.' },
      { q: 'How do I handle baby showers and announcements when I\'m struggling with infertility?', a: 'Give yourself permission to protect your own heart wisely. You do not have to attend every event. You do not have to perform joy you do not feel. Being honest with a trusted friend about what you need — and don\'t need — is not weakness. Grief and love for others can coexist; you are allowed to celebrate for others and still hurt for yourself.' },
    ],
    related: [
      { href: 'prayer-for-miscarriage-grief-2026-08-03.html', title: 'A Prayer for Those Who Grieve a Baby Never Held' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'prayer-for-the-estranged-2026-07-12.html',
    scripture: {
      heading: 'Scripture for Estrangement and Broken Relationships',
      verses: [
        { ref: 'Luke 15:20', text: '"But while he was still a long way off, his father saw him... and ran to him."', explanation: 'The father in the prodigal son parable was watching — actively, not passively. Estrangement does not end the watching. Hope does not require proximity.' },
        { ref: 'Romans 12:18', text: '"If it is possible, as far as it depends on you, live at peace with everyone."', explanation: 'Paul\'s qualifier is important: "as far as it depends on you." Reconciliation requires two people. You are responsible for your side of it. You are not responsible for theirs.' },
        { ref: 'Psalm 27:10', text: '"Though my father and mother forsake me, the Lord will receive me."', explanation: 'This verse names the worst case — abandoned by the people who should have been closest. And it says: even then, God receives you. Estrangement from family does not mean estrangement from belonging.' },
      ]
    },
    reflection: `<p>Estrangement is a particular kind of grief because the loss is ongoing and unresolved. Unlike death, there is no funeral, no acknowledged mourning period, no casseroles from neighbors. The person is still alive, still in the world — and yet the relationship has gone cold or broken entirely. You may not even be sure when it happened or whose fault it was, and that ambiguity can be its own kind of torment.</p>
<p>Estrangement arrives in many forms: a sibling who stopped returning calls years ago, a parent whose wounds became too much to be around, a child who cut contact, a friendship that collapsed under the weight of a conflict that never got resolved. Each carries its own texture of pain and its own complications around hope and repair.</p>
<p>Romans 12:18 offers one of the most honest and freeing instructions in Scripture for this situation: "as far as it depends on you." You cannot force reconciliation. You cannot make someone want the relationship you want. What you can do is tend your own side — release resentment, remain open, pray without demanding an outcome, and leave the door as open as it is safe to leave it. That is all God requires of you. The rest belongs to the other person and to God.</p>
<p>If you are on the receiving end of estrangement — someone has cut you off and you do not fully understand why — the pain of that particular silence can be profound. Allow yourself to grieve it fully. Seek counsel to understand what you may have contributed, and also to receive honest perspective on what is not yours to carry. And hold on to the knowledge that your worth is not determined by the people who cannot currently see it.</p>`,
    faqs: [
      { q: 'Is estrangement from family ever okay as a Christian?', a: 'Yes. While the Bible values family and reconciliation, it also recognizes that some relationships cause harm that requires distance. Safety — physical or psychological — is not unspiritual. Romans 12:18 says "as far as it depends on you" and "if it is possible," which acknowledges that peace is not always possible. Maintaining distance from abusive or deeply destructive relationships can be wise stewardship of the life God gave you.' },
      { q: 'How do I forgive someone I\'m estranged from?', a: 'Forgiveness is not the same as reconciliation. You can release someone from the debt of what they owe you — for your own freedom, not their benefit — without restoring the relationship. Forgiveness is between you and God; reconciliation requires both parties. Work on forgiveness privately, through prayer and possibly counseling, separate from any decision about whether to restore contact.' },
      { q: 'What does the Bible say about reconciliation?', a: '2 Corinthians 5:18-19 describes reconciliation as central to the gospel — God reconciled us to himself through Christ and gave us a ministry of reconciliation. But this is modeled as God reaching toward us while we were still estranged. Reconciliation requires initiation and risk. It is not guaranteed to succeed, but it is always worth attempting when it is safe to do so.' },
      { q: 'How do I pray for someone I\'m estranged from?', a: 'Start with honesty. Name the pain, the confusion, the grief, the anger — all of it. Then, when you are able, begin to pray for their wellbeing separate from any expectation of restoration. "God, I release [name] to You. I cannot fix this, and I cannot control it. Bless them. Work in them. And work in me." That prayer can coexist with very complicated feelings about the person.' },
    ],
    related: [
      { href: 'prayer-for-parent-of-prodigal-2026-07-24.html', title: 'A Prayer for the Parent of a Prodigal' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
    ]
  },

  {
    file: 'prayer-for-staying-sober-2026-07-17.html',
    scripture: {
      heading: 'Scripture for the Fight to Stay Sober',
      verses: [
        { ref: '1 Corinthians 10:13', text: '"No temptation has overtaken you except what is common to mankind. And God is faithful; he will not let you be tempted beyond what you can bear."', explanation: 'This is not a promise that temptation will be easy. It is a promise that it will not be impossible — and that God will provide a way through. That way sometimes looks like a sponsor, a meeting, a phone call, a prayer.' },
        { ref: '2 Corinthians 12:9', text: '"My grace is sufficient for you, for my power is made perfect in weakness."', explanation: 'The person who knows they cannot do this alone is in a better position than the person who thinks they can. Weakness, fully acknowledged, is the beginning of real help.' },
        { ref: 'Philippians 4:13', text: '"I can do all this through him who gives me strength."', explanation: 'This is not a verse about accomplishing anything you set your mind to. It is Paul writing from prison, saying he has learned contentment in every circumstance — including deprivation — through Christ\'s strength. One day at a time, sometimes one hour at a time, with that strength.' },
      ]
    },
    reflection: `<p>Sobriety is a daily discipline, and some days it costs more than others. The person who has been sober for years and the person who is on day three are both fighting — just different battles. The fight does not disappear with time; it changes shape. And the spiritual dimension of that fight is real, whatever your tradition calls it.</p>
<p>Addiction is many things at once: biological, psychological, relational, and for many people, deeply spiritual. The hunger that drives it is often a hunger for something real — relief from pain, connection, peace, escape from a self that feels unbearable. Those are not small needs. They are profound needs that deserve profound answers. The lie of addiction is that the substance or behavior actually provides those things. The truth is that it borrows relief from the future and charges interest you will pay in ways you did not choose.</p>
<p>The twelve-step tradition, whatever its flaws, got something deeply right: the first step is admitting powerlessness, and the second is acknowledging a power greater than yourself. This is not weakness. It is the most accurate description of the human condition available. You cannot manage addiction alone. No one can. The gospel agrees: "apart from me you can do nothing" (John 15:5) is not an insult. It is an invitation to stop white-knuckling it and start leaning on something that actually holds.</p>
<p>If you are fighting to stay sober today, you are doing something extraordinarily hard and extraordinarily important. Each day that you choose sobriety is a vote for the life you want, for the person you are becoming, for the relationships that depend on you being present and whole. That matters. And on the days when it feels like it doesn\'t — like the cost is too high and the benefit too distant — call someone before you make a decision you will regret. The phone call is the way through.</p>`,
    faqs: [
      { q: 'Is addiction a sin or a sickness?', a: 'Most Christian thinkers today recognize it as both — or neither category fully fits. Addiction involves real spiritual components (idolatry, bondage, powerlessness) and real physiological ones (brain chemistry, genetic predisposition). Treating it as purely a moral failure ignores science; treating it as purely medical ignores the spiritual freedom that genuine recovery requires. Compassion is the right starting point, not judgment.' },
      { q: 'How do I pray when I want to drink or use?', a: 'Short and immediate. "God, I need help right now." That is a complete prayer. Don\'t wait until the craving passes to pray — pray in the middle of it. Then take the next indicated action: call someone, go somewhere safe, change the environment. Prayer and action together are more powerful than either alone.' },
      { q: 'What does the Bible say about addiction?', a: 'The Bible does not use the word addiction, but it addresses bondage and enslavement directly. "Everyone who sins is a slave to sin" (John 8:34), but "if the Son sets you free, you will be free indeed" (8:36). Proverbs 23:29-35 describes wine\'s deceptive pull with striking psychological accuracy. Scripture takes the power of substance seriously while insisting that God\'s power is greater.' },
      { q: 'Can faith alone keep me sober?', a: 'Faith is essential, but God typically works through means — community, accountability, professional treatment, the practices that build new neural pathways and new habits. Faith without action is incomplete (James 2:17). For most people, lasting sobriety requires community, honest accountability, and often professional support alongside prayer. These are not failures of faith; they are how faith operates in the real world.' },
    ],
    related: [
      { href: 'prayer-for-lost-identity-2026-07-27.html', title: 'A Prayer for When You\'ve Lost Yourself' },
      { href: 'prayer-for-financial-shame-2026-07-30.html', title: 'A Prayer for Those Carrying Financial Shame' },
      { href: 'philippians-4-13-never-about-what-you-can-do-2026-08-05.html', title: 'Philippians 4:13 — It Was Never About What You Can Do' },
    ]
  },

  // ── SCRIPTURE PAGES ──────────────────────────────────────────────────────

  {
    file: 'psalm-22-1-when-god-feels-silent-2026-08-02.html',
    scripture: {
      heading: 'The Full Context of Psalm 22',
      verses: [
        { ref: 'Psalm 22:1-2', text: '"My God, my God, why have you forsaken me? Why are you so far from saving me, so far from my cries of anguish? I cry out by day, but you do not answer, by night, but I find no rest."', explanation: 'These are the exact words Jesus cried from the cross. They are not a failure of faith — they are a model of it. The psalmist brings his worst experience directly to God, without dressing it up.' },
        { ref: 'Psalm 22:24', text: '"For he has not despised or scorned the suffering of the afflicted one; he has not hidden his face from him but has listened to his cry for help."', explanation: 'The same psalm ends here. The silence was not abandonment. Psalm 22 begins with absence and ends with trust — not because the circumstances changed, but because the psalmist chose to trust in the character of God he knew even when he could not feel it.' },
        { ref: 'Matthew 27:46', text: '"About three in the afternoon Jesus cried out in a loud voice: "My God, my God, why have you forsaken me?"', explanation: 'Jesus quoted Psalm 22 from the cross. This means God, in human form, experienced the very silence this psalm describes. You are not in territory God does not know from the inside.' },
      ]
    },
    reflection: `<p>Psalm 22 begins as one of the most desperate cries in the entire Bible and ends as one of the most triumphant. That arc is not accidental — it is the shape of honest faith. Not faith that never doubts, but faith that brings the doubt directly to God and keeps talking until something shifts. The shift in Psalm 22 does not come from changed circumstances. It comes from the psalmist moving from his feelings to his memory — from "I feel forsaken" to "our ancestors trusted you and were not put to shame."</p>
<p>The silence of God is one of the most common and most frightening experiences in the spiritual life. Every tradition within Christianity has grappled with it. The mystics called it desolation. John of the Cross called it the dark night of the soul. Mother Teresa, in her private letters, described decades of feeling nothing from God while publicly projecting faith. What the tradition consistently finds is that the silence is not the same thing as the absence — and that it often precedes a depth of trust that good feelings alone cannot produce.</p>
<p>Jesus's quotation of Psalm 22 from the cross is one of the most important details in the Gospels. The Son of God, fully human, experienced the felt abandonment this psalm describes. That means the silence you feel has been entered by God himself. You are not in foreign territory to Him. You are in territory He knows from the inside — and He came through it.</p>
<p>If you are in a season of God's silence, the instruction from both Psalm 22 and from Jesus is not to give up but to keep talking. "My God, my God" — the address itself is the act of faith. You are still calling Him "my God" in the middle of the question. That is what faith looks like in the dark.</p>`,
    faqs: [
      { q: 'Why does God sometimes feel silent?', a: 'Scripture does not give a single answer to this question, which is itself instructive — God does not owe us an explanation for His timing. What Scripture does offer is consistent testimony that the silence is not the same as absence (Hebrews 13:5), that it is a common human experience among the most faithful believers, and that persevering through it produces a depth of faith that good feelings alone cannot build (Romans 5:3-4).' },
      { q: 'Is it okay to tell God He feels absent?', a: 'Yes — and Psalm 22, Psalm 88, Lamentations, Job, and many other scriptures model exactly this. God preserved these raw cries in Scripture for a reason. Honest prayer about God\'s felt absence is not faithlessness; it is the most intimate form of faith — staying in relationship even when the relationship feels one-sided.' },
      { q: 'What is the dark night of the soul?', a: 'A term coined by 16th-century mystic John of the Cross to describe a period in the spiritual life when a believer feels profound spiritual dryness and the absence of God\'s presence. Far from being a spiritual failure, John describes it as a purification — God weaning the soul from dependence on spiritual feelings so that faith can be rooted in something deeper and more durable than emotion.' },
      { q: 'How do I keep praying when I feel like God isn\'t listening?', a: 'Use the Psalms. They were written precisely for this. Psalm 22, 42, 88, and many others are ready-made prayers for seasons of silence. Sometimes praying someone else\'s words when you have none of your own is exactly the right move. You can also simply tell God what you just told that question: "I feel like you\'re not listening." Start there.' },
    ],
    related: [
      { href: 'psalm-88-when-god-goes-silent-2026-07-16.html', title: 'Psalm 88 — When God Goes Silent' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
    ]
  },

  {
    file: 'romans-8-28-not-everything-is-good-2026-07-29.html',
    scripture: {
      heading: 'Romans 8:28 in Full Context',
      verses: [
        { ref: 'Romans 8:28', text: '"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."', explanation: 'The verse does not say all things ARE good. It says God works through all things. That distinction matters enormously to anyone in the middle of something that is genuinely bad.' },
        { ref: 'Romans 8:26', text: '"In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans."', explanation: 'Paul places this promise in the context of not knowing what to pray. Romans 8:28 is not for people who have it figured out. It is for people who don\'t know what they\'re asking for anymore.' },
        { ref: 'Genesis 50:20', text: '"You intended to harm me, but God intended it for good to accomplish what is now being done."', explanation: 'Joseph says this after years of slavery, imprisonment, and betrayal. Not at the beginning of his suffering — at the end. The pattern in Scripture is that we often cannot see Romans 8:28 working until we look back.' },
      ]
    },
    reflection: `<p>Romans 8:28 is one of the most cited verses in the Bible — and one of the most misapplied. In the hands of someone who means well but hasn't thought carefully, it becomes a way of deflecting real pain: "Well, God works all things together for good, so it'll be fine." That isn't what Paul said, and it isn't helpful to someone in the middle of something genuinely terrible.</p>
<p>What Paul actually says is that God works — actively, continuously — through all things toward good. The word translated "works" (synergei) suggests a working together, a weaving. It does not promise that each individual thread is beautiful. Some threads in a tapestry are dark, rough, seemingly purposeless from up close. The promise is about what they are being woven into, not about the thread itself.</p>
<p>The verse also has conditions that often get dropped when it is quoted: "for those who love him, who have been called according to his purpose." This is not a universal promise that everything always works out for everyone. It is a promise for those in relationship with God — and even then, it does not name a timeline. Joseph could not have quoted Romans 8:28 meaningfully on day one of his slavery. He could only say it after Egypt. The view from inside the pit is not the same as the view from the throne room.</p>
<p>If someone has quoted this verse at you in a moment of real pain, and it felt hollow or even cruel, that is a reasonable response to bad theology. The real verse — in full context, read honestly — is one of the most sustaining promises in Scripture. It does not deny your pain. It says your pain is being held by someone who knows exactly where it is going, and that destination is good. That is a very different thing.</p>`,
    faqs: [
      { q: 'Does Romans 8:28 mean everything happens for a reason?', a: 'Not in the way the phrase is usually used. "Everything happens for a reason" often implies God caused your suffering for a specific purpose. Romans 8:28 is not about cause — it is about outcome. God does not cause evil. But He is working, even through evil and suffering, toward something redemptive. These are very different theological claims.' },
      { q: 'What is the "good" in Romans 8:28?', a: 'Paul defines it in the very next verse (8:29): being conformed to the image of God\'s Son. The good is not primarily comfort, success, or pain removal. It is becoming more fully like Christ. That is a long-term, costly, and ultimately magnificent goal — but it is very different from "things will work out nicely."' },
      { q: 'Can I quote Romans 8:28 to someone who is suffering?', a: 'With great care, if at all. In most acute grief situations, what people need first is to feel heard, not instructed. This verse lands differently at day one versus year five. Sitting with someone in their pain, without offering premature resolution, is usually more faithful to the gospel than quoting the verse that makes you feel like you\'ve said something helpful.' },
      { q: 'What if I can\'t see how any good is coming from my situation?', a: 'That is the honest experience for most people in real suffering. The promise is not that you will be able to see it while you are in it. Joseph could not see it in the pit. Jesus could not feel it on the cross. The promise is that God sees it — that He is working even when the evidence is invisible to you. Faith here means trusting the character of God rather than the current evidence.' },
    ],
    related: [
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-lost-identity-2026-07-27.html', title: 'A Prayer for When You\'ve Lost Yourself' },
      { href: 'philippians-4-13-never-about-what-you-can-do-2026-08-05.html', title: 'Philippians 4:13 — It Was Never About What You Can Do' },
    ]
  },

  {
    file: 'philippians-4-13-never-about-what-you-can-do-2026-08-05.html',
    scripture: {
      heading: 'Philippians 4:13 — What It Actually Means',
      verses: [
        { ref: 'Philippians 4:11-13', text: '"I have learned, in whatever state I am, to be content... I know how to be abased, and I know how to abound... I can do all things through Christ who strengthens me."', explanation: 'Context changes everything. Paul is not writing from victory — he is writing from prison, describing contentment in deprivation. "All things" here means every circumstance, not every ambition.' },
        { ref: 'Philippians 4:6-7', text: '"Do not be anxious about anything, but in every situation, by prayer and petition... present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts."', explanation: 'The promise just before 4:13 is about peace, not power. Paul\'s Philippians 4 is about a settled heart in unsettled circumstances — not about capability or achievement.' },
        { ref: '2 Corinthians 12:9-10', text: '"My grace is sufficient for you, for my power is made perfect in weakness... For when I am weak, then I am strong."', explanation: 'Paul\'s theology is consistently about strength through weakness, not strength despite it. Philippians 4:13 fits this pattern: Christ\'s strength is the resource for endurance, not for unlimited human capability.' },
      ]
    },
    reflection: `<p>Philippians 4:13 may be the most misquoted verse in American Christianity. It appears on athletic wear, motivational posters, and pre-game locker room speeches as a promise that faith enables you to accomplish anything you set your mind to. That is not what Paul wrote, and the misapplication matters — because it sets people up to feel spiritually deficient when faith does not produce the outcomes they expected.</p>
<p>Paul wrote Philippians 4:13 from a Roman prison cell, in the context of describing what he had learned about contentment in poverty and abundance alike. The "all things" he can do through Christ is not a list of achievements — it is a list of circumstances: imprisonment, hardship, deprivation, uncertainty. He is saying that Christ's strength enables him to endure any situation with a settled heart. That is a profound promise. It is just not the one on the jersey.</p>
<p>The theological error in the misapplication is significant. If Philippians 4:13 means you can accomplish anything through faith, then failure becomes evidence of insufficient faith. The athlete who loses, the entrepreneur whose business fails, the person whose illness is not healed — all are implicitly told that they just didn't believe enough. This is not the gospel. This is prosperity theology with a verse attached.</p>
<p>The real promise is actually more useful for more people in more situations: in whatever circumstance you find yourself — even the ones that feel unsurvivable — Christ's strength is sufficient for you to get through it with integrity, peace, and even gratitude. That is not small. For someone in a genuinely hard place, that promise is everything. It just doesn't look great on a jersey.</p>`,
    faqs: [
      { q: 'What does Philippians 4:13 actually mean?', a: '"I can do all things through Christ who strengthens me" means Paul can endure all circumstances — poverty, abundance, imprisonment, hardship — through the strength Christ provides. The context (4:11-12) makes clear he is talking about contentment in varying life situations, not the ability to achieve unlimited goals. It is a promise about endurance and peace, not athletic or professional capability.' },
      { q: 'Is it wrong to use Philippians 4:13 as motivation?', a: 'Not if the motivation is rooted in what the verse actually promises. If it means "I can face whatever comes today with Christ\'s help," that is faithful and true. If it means "I can accomplish anything I set my mind to because I have faith," that misrepresents Scripture and sets up theological confusion when goals are not achieved.' },
      { q: 'Why is Philippians 4:13 so often misunderstood?', a: 'Partly because it is quoted without context, and partly because the misapplication is genuinely appealing — it makes faith sound like a superpower. But Paul\'s actual theology runs in the opposite direction: "when I am weak, then I am strong" (2 Corinthians 12:10). The power comes through acknowledged limitation, not through unlimited capability.' },
      { q: 'What is Paul saying about contentment in Philippians 4?', a: 'Paul says contentment is learned, not given — "I have learned, in whatever state I am, to be content." It is a discipline developed through experience with God in both difficult and abundant circumstances. It is not the absence of preference or feeling; it is a deep-rooted stability that does not rise and fall with circumstances. And it is available through Christ\'s strength, not human willpower.' },
    ],
    related: [
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-staying-sober-2026-07-17.html', title: 'A Prayer for Those Fighting to Stay Sober' },
    ]
  },

  // ── SONGS ────────────────────────────────────────────────────────────────

  {
    file: 'song-still-my-god-2026-07-31.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Habakkuk 3:17-18', text: '"Though the fig tree does not bud and there are no grapes on the vines... yet I will rejoice in the Lord, I will be joyful in God my Savior."', explanation: 'Habakkuk names every form of agricultural failure — complete economic and physical collapse — and then says "yet." That single word is the entire theology of this song. Praise that does not depend on circumstances.' },
        { ref: 'Job 13:15', text: '"Though he slay me, yet will I hope in him."', explanation: 'Job\'s declaration of faith from the ash heap. The phrase "yet will I" appears throughout Scripture as the grammar of stubborn faith — the choice to trust when everything argues against it.' },
        { ref: 'Psalm 46:1-2', text: '"God is our refuge and strength, an ever-present help in trouble. Therefore we will not fear, though the earth give way."', explanation: 'The logic of "therefore" is the logic of this song. Because of who God is, the conclusion holds — even when the ground is shaking.' },
      ]
    },
    reflection: `<p>Stubborn faith is not the same as happy faith. It does not require feeling good about your circumstances or pretending that the fig tree is budding when it is not. Habakkuk's declaration — "yet I will rejoice" — is extraordinary precisely because it follows an honest, unflinching inventory of everything that is wrong. He does not skip the listing. He names every failure, every loss, every reason to despair. And then he says "yet."</p>
<p>This is the most durable form of worship: not the spontaneous overflow of gratitude on a good day, but the deliberate, effortful choice to declare God's goodness on a bad one. The Psalms are full of it. Lamentations is built on it. The entire book of Job circles it. This kind of faith is not naive — it has looked directly at the hard thing and decided to trust anyway.</p>
<p>If you are singing this song from a place of genuine harvest — things are good, faith comes easily — sing it as a declaration of what you would hold onto if they weren't. And if you are singing it from a place of barrenness, this song was written for you. The "yet" in the third verse is where the song actually lives.</p>`,
    faqs: [
      { q: 'What is Habakkuk 3:17-18 about?', a: 'Habakkuk 3 is the prophet\'s prayer and song after receiving God\'s answer to his complaints about injustice. Verses 17-18 list every form of agricultural disaster — complete economic collapse — and then declare praise anyway. It is considered one of the most striking examples of faith in Scripture precisely because it is so honest about what faith is costing the speaker.' },
      { q: 'How do I worship God when I don\'t feel like it?', a: 'Exactly the way Habakkuk did — by naming what is hard, then making the deliberate choice to declare God\'s goodness anyway. Worship is not primarily a feeling; it is an act of the will. The feelings often follow the act, but they are not required to precede it. Start with the words. Let the heart catch up.' },
      { q: 'What is "stubborn faith" in Christianity?', a: 'Faith that persists through evidence that argues against it — not by denying the evidence, but by trusting the character of God more than the current circumstances. It is the faith of Job, Habakkuk, Paul in prison, and Jesus in Gethsemane. It is the most mature and durable form of Christian faith, and it is typically only built through seasons of genuine difficulty.' },
    ],
    related: [
      { href: 'song-even-in-the-dark-2026-07-10.html', title: 'Song: Even in the Dark' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
    ]
  },

  {
    file: 'song-even-here-2026-07-25.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Psalm 139:7-10', text: '"Where can I go from your Spirit? Where can I flee from your presence?... If I rise on the wings of the dawn, if I settle on the far side of the sea, even there your hand will guide me."', explanation: 'The theological foundation of this song: no geography exists where God is not. "Even here" is the application of Psalm 139\'s everywhere.' },
        { ref: 'Romans 8:38-39', text: '"Neither death nor life... neither height nor depth... will be able to separate us from the love of God that is in Christ Jesus our Lord."', explanation: 'Paul\'s list covers every dimension — time, space, spiritual power, circumstance. The repetition is deliberate: whatever you name, it is not on the list of things that separate you from God.' },
        { ref: 'Genesis 28:16', text: '"When Jacob awoke from his sleep, he thought, \'Surely the Lord is in this place, and I was not aware of it.\'"', explanation: 'Jacob discovers God\'s presence not in a sanctuary but on the run, sleeping on rocks, at one of the lowest points of his life. The discovery is not that God showed up — it is that God was already there.' },
      ]
    },
    reflection: `<p>The word "even" carries enormous weight in Christian devotion. "Even here" — in the hospital room, in the divorce court, in the addiction, in the depression, in the grief that has not lifted. The claim that God is present in extraordinary places is easy enough to hold theoretically. The claim that He is present in the worst specific place you are actually standing right now — that is the harder, more personal, more necessary faith.</p>
<p>Jacob discovered this at Bethel not in a moment of spiritual vitality but in flight, alone, frightened, using a rock as a pillow. He woke from a dream of heaven touching earth and said "Surely the Lord is in this place — and I was not aware of it." The divine presence did not require his awareness. It was there before he knew it. That is often the shape of God's presence in hard seasons: not announced, not felt in real time, but discovered in retrospect — or in a dream, or in a song, or in a prayer that suddenly unlocks something.</p>
<p>If you are in a place right now where God feels very far away, this song is a declaration rather than a description of experience. You are singing toward what you believe rather than from what you feel. That is not dishonesty. That is the practice of faith — speaking the truth of who God is until your experience catches up with what you know.</p>`,
    faqs: [
      { q: 'Does God\'s presence go everywhere with us?', a: 'Yes, according to Scripture. Psalm 139 is the fullest treatment of this — from the heights to the depths to Sheol itself, God\'s presence is inescapable. This is meant as comfort: there is no pit deep enough to be outside His reach. The felt absence of God in hard seasons is real — but it is not the same as actual absence.' },
      { q: 'Why does God feel absent in difficult times?', a: 'Spiritual dryness and felt absence are common experiences that do not necessarily reflect theological reality. Many factors affect our felt sense of God\'s presence — depression, grief, exhaustion, sin, simply the nature of faith as trust in what cannot always be felt. The testimony of Scripture and the saints is that God is closest to the brokenhearted (Psalm 34:18) even when He cannot be felt.' },
    ],
    related: [
      { href: 'song-where-can-i-go-2026-07-15.html', title: 'Song: Where Can I Go' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
    ]
  },

];

// ── HTML builder (identical to batch 1) ───────────────────────────────────────

function buildScriptureSection(scripture) {
  const verses = scripture.verses.map(v => `
    <div style="border-left:3px solid #7A9E7E;padding:12px 16px;margin-bottom:20px;background:#f9f7f4;border-radius:0 8px 8px 0;">
      <p style="font-weight:700;color:#2c1f14;margin:0 0 6px;">${v.ref}</p>
      <p style="font-style:italic;color:#5a4a3a;margin:0 0 10px;">${v.text}</p>
      <p style="font-size:0.92rem;color:#555;margin:0;">${v.explanation}</p>
    </div>`).join('');
  return `\n<div class="prayer-card" style="margin-top:32px;">\n  <h2 style="font-size:1.2rem;color:#2c1f14;margin-bottom:20px;">${scripture.heading}</h2>\n  ${verses}\n</div>`;
}

function buildReflectionSection(reflection) {
  return `\n<div class="prayer-card" style="background:#f9f7f4;margin-top:16px;">\n  <h2 style="font-size:1.1rem;color:#7A9E7E;margin-bottom:16px;">Going Deeper</h2>\n  ${reflection}\n</div>`;
}

function buildFaqSection(faqs) {
  const items = faqs.map(faq => `
    <div style="border-bottom:1px solid #e8e0d5;padding:16px 0;">
      <h3 style="font-size:1rem;color:#2c1f14;margin:0 0 8px;">${faq.q}</h3>
      <p style="font-size:0.93rem;color:#555;margin:0;">${faq.a}</p>
    </div>`).join('');
  const schemaItems = faqs.map(faq => ({"@type":"Question","name":faq.q,"acceptedAnswer":{"@type":"Answer","text":faq.a}}));
  return `\n<div class="prayer-card" style="margin-top:16px;">\n  <h2 style="font-size:1.2rem;color:#2c1f14;margin-bottom:4px;">Frequently Asked Questions</h2>\n  ${items}\n</div>\n<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":schemaItems})}<\/script>`;
}

function buildRelatedSection(related) {
  const links = related.map(r => `\n    <a href="${r.href}" style="display:block;padding:12px 16px;border:1px solid #e8e0d5;border-radius:8px;text-decoration:none;color:#2c1f14;font-weight:600;font-size:0.92rem;margin-bottom:10px;" >${r.title} →</a>`).join('');
  return `\n<div class="prayer-card" style="margin-top:16px;">\n  <h2 style="font-size:1.1rem;color:#2c1f14;margin-bottom:16px;">Continue Reading</h2>\n  ${links}\n</div>`;
}

let processed = 0, skipped = 0;
const urlsToIndex = [];

for (const expansion of EXPANSIONS) {
  const filepath = path.join(SITE_DIR, expansion.file);
  if (!fs.existsSync(filepath)) { console.log(`SKIP (not found): ${expansion.file}`); skipped++; continue; }
  let html = fs.readFileSync(filepath, 'utf8');
  if (html.includes('Frequently Asked Questions') && html.includes('Going Deeper')) { console.log(`SKIP (already expanded): ${expansion.file}`); skipped++; continue; }

  const injection =
    buildScriptureSection(expansion.scripture) +
    buildReflectionSection(expansion.reflection) +
    buildFaqSection(expansion.faqs) +
    buildRelatedSection(expansion.related);

  if (html.includes('<div class="email-section">')) {
    html = html.replace('<div class="email-section">', injection + '\n<div class="email-section">');
  } else if (html.includes('</section>')) {
    html = html.replace('</section>', injection + '\n</section>');
  } else { console.log(`WARN: no injection point for ${expansion.file}`); skipped++; continue; }

  fs.writeFileSync(filepath, html, 'utf8');
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`✓ ${expansion.file} — ~${words}w`);
  urlsToIndex.push(`${SITE_URL}/${expansion.file}`);
  processed++;
}

console.log(`\nDone: ${processed} expanded, ${skipped} skipped.`);

if (urlsToIndex.length > 0) {
  const body = JSON.stringify({ host: 'faithfulpassages.com', key: INDEXNOW_KEY, keyLocation: `https://faithfulpassages.com/${INDEXNOW_KEY}.txt`, urlList: urlsToIndex });
  const req = https.request({ hostname: 'api.indexnow.org', path: '/indexnow', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) } }, res => console.log(`IndexNow: ${res.statusCode}`));
  req.on('error', e => console.error('IndexNow error:', e.message));
  req.write(body); req.end();
}
