#!/usr/bin/env node
/**
 * Faithful Passages — Page Content Expander BATCH 3
 * Remaining songs + scripture pages
 */
'use strict';
const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_DIR = path.join(__dirname, '../sites/faithfulpassages.com');
const SITE_URL = 'https://faithfulpassages.com';
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

const EXPANSIONS = [

  {
    file: 'song-even-now-you-hold-2026-07-22.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Romans 8:38-39', text: '"Neither death nor life... neither the present nor the future... will be able to separate us from the love of God."', explanation: 'Paul\'s list is comprehensive by design. He names every category of existence and declares that none of them is a separator. The hold does not loosen.' },
        { ref: 'Isaiah 41:13', text: '"For I am the Lord your God who takes hold of your right hand and says to you, Do not fear; I will help you."', explanation: 'The image is physical, immediate, intimate. Not God watching from a distance but God taking your hand. "Even now you hold" is this verse in song form.' },
        { ref: 'Deuteronomy 33:27', text: '"The eternal God is your refuge, and underneath are the everlasting arms."', explanation: 'Underneath. Not alongside, not above — underneath, bearing weight. The hold is structural, not optional.' },
      ]
    },
    reflection: `<p>There is a kind of faith that requires evidence — that rises and falls with visible outcomes, with answers to prayer, with the felt sense of God's presence. And then there is the kind of faith this song is about: a trust in the hold even when you cannot feel the hands.</p>
<p>Romans 8:38-39 is one of the most comprehensive promises in Scripture. Paul works through every dimension of existence — time, death, life, powers, heights, depths — and says of each: not this. Not this one either. None of these separates you from God's love. The structure of the promise is important: it does not rest on your grip. It rests on His.</p>
<p>The image in Isaiah 41:13 — God taking your right hand — is surprisingly physical for a passage about the sovereign Lord of creation. It suggests intimacy, proximity, the kind of steadying that happens between two people when one of them is about to fall. "Even now you hold" is the claim that this steadying is happening whether or not you can feel it.</p>
<p>If you are singing this song from a place where the hold feels very far away, sing it as a declaration of theology rather than a description of experience. Theology first, feeling second. The hold does not depend on your awareness of it — but your awareness of it changes everything about how you move through the day.</p>`,
    faqs: [
      { q: 'What does it mean that God holds us?', a: 'Scripture uses the image of God\'s holding in multiple ways: His hand taking ours (Isaiah 41:13), His arms underneath us (Deuteronomy 33:27), His grip that no one can break (John 10:28-29). The consistent message is that our security does not depend on our grip on God but on His grip on us. We do not hold on — we are held.' },
      { q: 'How do I trust God when I don\'t feel His presence?', a: 'Ground your trust in theology rather than feeling. What do you know to be true about God\'s character and promises, independent of how you feel today? That knowledge is the anchor. Feelings are real and worth naming, but they are not the most reliable gauge of theological reality. Tell God exactly how you feel — and then rehearse what you know.' },
    ],
    related: [
      { href: 'song-still-you-hold-me-2026-07-07.html', title: 'Song: Still You Hold Me' },
      { href: 'song-even-here-2026-07-25.html', title: 'Song: Even Here' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
    ]
  },

  {
    file: 'song-though-i-cannot-see-2026-08-04.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: '2 Corinthians 5:7', text: '"For we live by faith, not by sight."', explanation: 'Eight words that describe the entire Christian life. Faith is not the absence of doubt; it is the choice to act on what you believe when you cannot see it confirmed.' },
        { ref: 'Hebrews 11:1', text: '"Now faith is confidence in what we hope for and assurance about what we do not see."', explanation: 'Faith is defined here as substance and evidence — not feelings, not certainty, but a real confidence in something real that is not yet visible.' },
        { ref: 'John 20:29', text: '"Then Jesus told him, \'Because you have seen me, you have believed; blessed are those who have not seen and yet have believed.\'"', explanation: 'Jesus speaks this directly to the situation of every Christian who has ever lived after the first Easter. The blessing is specifically for those who believe without sight.' },
      ]
    },
    reflection: `<p>Thomas gets a reputation as the doubter, but his request was entirely reasonable: he wanted what everyone else in that room had gotten — direct, physical, verifiable experience of the risen Christ. What makes Jesus's response so striking is that He doesn't rebuke the desire. He meets it. He shows Thomas the wounds. And then He says something remarkable: "blessed are those who have not seen and yet have believed." That is the rest of us. That is this song.</p>
<p>Faith without sight is not inferior faith. It is a different kind of faith — one that has not been given the easiest possible form of verification and has chosen to believe anyway. That choice, made every day in the absence of visible confirmation, is what the Hebrews 11 "Hall of Faith" celebrates. Abraham left without knowing where he was going. Moses chose suffering with God's people over the visible security of Egypt. They all "did not receive the things promised; they only saw them and welcomed them from a distance" (Hebrews 11:13).</p>
<p>The experience of not seeing — of praying into silence, of trusting a promise that has not yet materialized, of holding on to what you believe when every visible fact argues against it — is not the failure of faith. It is often the purest form of it. This song is for those seasons. Not a denial of the difficulty, but a declaration of the choice.</p>`,
    faqs: [
      { q: 'Is it okay to have doubts as a Christian?', a: 'Yes. Doubt is not the opposite of faith — it is often a part of it. Thomas doubted; Jesus met him there. The Psalms are saturated with doubt, complaint, and questioning. What matters is where you bring your doubt: not away from God, but toward Him. Honest doubt brought to God is an act of relationship, not a failure of it.' },
      { q: 'What does "walking by faith not by sight" mean practically?', a: 'It means making decisions based on what you believe to be true about God\'s character and promises rather than what your current circumstances suggest. It does not mean ignoring reality — it means refusing to let current reality have the final word. Every time you pray without an immediate answer, every time you choose integrity when dishonesty would benefit you, every time you hold on in a dry season — that is walking by faith.' },
    ],
    related: [
      { href: 'song-even-here-2026-07-25.html', title: 'Song: Even Here' },
      { href: 'song-still-my-god-2026-07-31.html', title: 'Song: Still My God' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'song-where-can-i-go-2026-07-15.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Psalm 139:7-10', text: '"Where can I go from your Spirit? Where can I flee from your presence? If I go up to the heavens, you are there; if I make my bed in the depths, you are there."', explanation: 'The song is a direct meditation on this passage. David\'s question — "where can I go?" — is rhetorical. The answer is: nowhere. And that is the comfort.' },
        { ref: 'Jonah 1:3', text: '"But Jonah ran away from the Lord and headed for Tarshish."', explanation: 'The most famous attempt to flee God\'s presence — and it didn\'t work. Jonah\'s story ends not with abandonment but with rescue. God followed him into the depths.' },
        { ref: 'Psalm 139:11-12', text: '"If I say, \'Surely the darkness will hide me and the light become night around me,\' even the darkness will not be dark to you."', explanation: 'Even in the places we think are hidden, God sees. This can feel invasive in some moods — in others, it is the only comfort available.' },
      ]
    },
    reflection: `<p>Psalm 139 is the most thorough treatment of divine omnipresence in Scripture, and it is profoundly personal. David is not writing a theological treatise — he is writing a prayer, addressed directly to the God who knows him completely. "You have searched me and known me" (139:1). Before the song of omnipresence comes the confession of being thoroughly known.</p>
<p>That sequence matters. "Where can I go?" lands differently if you know that God's presence is the presence of someone who fully knows you. If you have a complicated relationship with God — or with yourself — the idea of being inescapably known and inescapably accompanied can feel like surveillance rather than love. The psalm addresses this: "How precious to me are your thoughts, God" (139:17). The One who is everywhere and knows everything holds you as precious. That changes the nature of the everywhere.</p>
<p>There is also the Jonah dimension of this song: the places we run to when we are fleeing. Not from God in theory, but from what He is asking of us, what He knows about us, what we fear He will do with what He knows. Jonah ran to Tarshish — the farthest known point from where God was calling him. And God sent a storm, then a fish, then a second chance. The inescapability of God\'s presence is not primarily a surveillance system. It is the mechanism of rescue.</p>`,
    faqs: [
      { q: 'Does God know everything about me?', a: 'Yes, according to Scripture. Psalm 139 is the fullest description: God knows your sitting and rising, your thoughts from afar, your words before you speak them, your days before they exist. This knowledge is not described as threatening but as intimate and precious. You are fully known and fully loved simultaneously — that is the gospel in miniature.' },
      { q: 'Can I hide from God?', a: 'No — and Jonah\'s story is the definitive illustration of why. But the more important question is: why would you want to? What are you carrying that you think God can\'t handle? The invitation of Psalm 139 is to stop hiding and be known — fully, honestly, without the performance. That is the beginning of real intimacy with God.' },
    ],
    related: [
      { href: 'song-even-here-2026-07-25.html', title: 'Song: Even Here' },
      { href: 'song-even-now-you-hold-2026-07-22.html', title: 'Song: Even Now You Hold' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'song-come-back-to-me-2026-07-19.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Hosea 14:1-2', text: '"Return, Israel, to the Lord your God. Your sins have been your downfall! Take words with you and return to the Lord."', explanation: 'God\'s instruction through Hosea is striking: come back with words. Not with fixed behavior or full repentance yet — just with words. The invitation is to begin with honesty.' },
        { ref: 'Luke 15:17-18', text: '"When he came to his senses... he got up and went to his father. But while he was still a long way off, his father saw him."', explanation: 'The prodigal\'s return begins with coming to himself — recognizing where he was and where he could be. The song\'s "come back to me" is the voice of the father who was already watching.' },
        { ref: 'Revelation 3:20', text: '"Here I am! I stand at the door and knock. If anyone hears my voice and opens the door, I will come in."', explanation: 'The posture of God in this verse is remarkable: He is the one knocking. Not waiting to be sought out — actively pursuing, standing at the door, calling.' },
      ]
    },
    reflection: `<p>The voice in this song is God's — an invitation, not a demand. "Come back to me" is the recurring cry of the prophets, but it is never coercive. God will not force return. He positions himself at the door, He watches from the horizon, He sends the circumstance that brings the prodigal to himself — but the step back is always freely chosen.</p>
<p>Hosea's command is unusual: "Take words with you and return." He is not requiring a fully formed repentance, a changed life, or earned worthiness. He is saying: come with words. Come with honest speech. That is the starting place. The prodigal son prepared a speech on the road home — and never got to finish it. The father's embrace interrupted it. But he came with words. He came with honesty about where he had been.</p>
<p>If you are someone who has drifted from faith — through doubt, through hurt, through life getting complicated — this song is addressed to you. Not with judgment, not with requirements, but with a simple sustained invitation. Come back. You do not have to have it figured out. You do not have to have changed. You just have to come with words, start moving, and trust that the father who was watching for you is already running toward you on the road.</p>`,
    faqs: [
      { q: 'Can I come back to God after walking away for years?', a: 'Yes, completely. The prodigal son was welcomed without conditions when he returned — the father ran to him before the apology was finished. God\'s welcome is not dependent on the length of your absence, the severity of what happened while you were gone, or your level of spiritual health at the moment of return. You come as you are and are received as you are.' },
      { q: 'What if I don\'t feel like I can pray after being away from God?', a: 'That feeling is very common and is not a reason to stay away. Hosea\'s instruction was simply to "take words with you" — start with honest speech, whatever that looks like. "I don\'t know if I believe anymore" is a prayer. "I\'ve been gone a long time" is a prayer. God receives the first stumbling words as readily as the polished ones.' },
    ],
    related: [
      { href: 'prayer-for-lost-identity-2026-07-27.html', title: 'A Prayer for When You\'ve Lost Yourself' },
      { href: 'prayer-for-parent-of-prodigal-2026-07-24.html', title: 'A Prayer for the Parent of a Prodigal' },
      { href: 'song-even-here-2026-07-25.html', title: 'Song: Even Here' },
    ]
  },

  {
    file: 'song-even-in-the-dark-2026-07-10.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Psalm 88:1, 18', text: '"Lord, you are the God who saves me; day and night I cry out to you... darkness is my closest friend."', explanation: 'Psalm 88 is unique among the psalms — it ends in darkness, with no resolution. It is included in Scripture as validation that not all prayers get tidy endings. Faith can live in that.' },
        { ref: 'John 1:5', text: '"The light shines in the darkness, and the darkness has not overcome it."', explanation: 'The darkness is real. John does not pretend it isn\'t. But it has not won. "Even in the dark" is the claim of this verse: the light holds.' },
        { ref: 'Isaiah 45:3', text: '"I will give you hidden treasures, riches stored in secret places, so that you may know that I am the Lord."', explanation: 'God specifically promises things found in dark places. Some of what He gives can only be received in the darkness. That does not make the darkness good — it makes it something God can work through.' },
      ]
    },
    reflection: `<p>Psalm 88 is the most unrelenting lament in the Psalter. Every other lament psalm includes a turn — a moment where the psalmist remembers God's faithfulness, praises through the pain, or arrives at some resolution. Psalm 88 has no turn. It ends where it begins: "darkness is my closest friend." The psalm is preserved in Scripture exactly as it is. That is a theological statement in itself: God kept this prayer. He did not require it to end on a hopeful note before He would receive it.</p>
<p>The song "Even in the Dark" lives in that space — not denying the darkness, not wrapping it up prematurely, but making a claim about the light that holds even when the psalmist cannot feel it. John 1:5 says "the light shines in the darkness" — present tense, ongoing, not past victory only. The darkness has not overcome it. Not "will not" — "has not." It has been trying. It hasn't won.</p>
<p>If you are in a dark season — depression, grief, disillusionment, or simply a spiritual winter that will not break — this song does not require you to pretend otherwise. It asks only that you make the claim alongside your darkness: even here, the light holds. You may not see it. You may not feel it. But it has not gone out.</p>`,
    faqs: [
      { q: 'Is it okay to tell God about depression or despair?', a: 'Yes — and Psalm 88 exists specifically to show that God receives the darkest prayers without flinching. Bringing depression or despair to God is not faithlessness; it is the most honest form of prayer available in a hard season. If you are experiencing clinical depression, please also seek professional support — God works through counselors and medicine as surely as through prayer.' },
      { q: 'What does the Bible say about dark nights of the soul?', a: 'The language "dark night of the soul" comes from 16th-century mystic John of the Cross, but the experience is throughout Scripture: Elijah under the broom tree, Jeremiah\'s laments, Psalm 88, Jesus in Gethsemane. The consistent testimony is that God is present in these seasons — often working something deep that would not be possible in easier times — even when His presence cannot be felt.' },
    ],
    related: [
      { href: 'psalm-88-when-god-goes-silent-2026-07-16.html', title: 'Psalm 88 — When God Goes Silent' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
    ]
  },

  {
    file: 'song-where-else-would-i-go-2026-07-28.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'John 6:67-68', text: '"You do not want to leave too, do you?" Jesus asked the Twelve. Simon Peter answered him, "Lord, to whom shall we go? You have the words of eternal life."', explanation: 'Peter\'s answer is the text of this song. Not "we want to stay because it\'s easy." Because it isn\'t. Because even when Jesus\'s teaching was hard and his followers were leaving, Peter recognized there was nowhere better to go.' },
        { ref: 'Psalm 73:25-26', text: '"Whom have I in heaven but you? And earth has nothing I desire besides you. My flesh and my heart may fail, but God is the strength of my heart and my portion forever."', explanation: 'Asaph arrives at this declaration after a long crisis of faith in Psalm 73. It is not naive devotion — it is faith that has been tested and has chosen to stay.' },
        { ref: 'Joshua 24:15', text: '"But as for me and my household, we will serve the Lord."', explanation: 'Joshua\'s declaration after presenting the alternatives clearly to Israel. "Choose this day whom you will serve." The song is a personal version of that same deliberate choice.' },
      ]
    },
    reflection: `<p>John 6 is one of the most honest chapters in the Gospels. Jesus has said something difficult — "unless you eat my flesh and drink my blood you have no life in you" — and the crowd thins dramatically. "This is a hard teaching. Who can accept it?" (6:60). Many of his disciples leave. And Jesus turns to the Twelve and asks, almost plaintively: "You don't want to leave too, do you?"</p>
<p>Peter's answer is not triumphant. It is not "of course not, we would never!" It is: "Lord, to whom shall we go?" The logic is comparative and honest: I have looked around. I don't see anything better. You have the words of eternal life. This is where I'm staying — not because it's easy but because there is no better option I've found.</p>
<p>That kind of faith — the choosing to stay because you've looked at the alternatives and found them wanting — is perhaps more durable than the kind built on good feelings. It has done the comparison. It has sat with the hard teachings. It has watched people leave and felt the pull to leave with them. And it has come back to the same question: where else would I go?</p>
<p>If you are in a season of doubt, disillusionment, or spiritual struggle, this song is a legitimate place to stand. You don't have to have resolved the hard questions. You just have to be honest: I don't see anywhere better. I'm staying. That is a complete act of faith.</p>`,
    faqs: [
      { q: 'What does John 6:68 mean?', a: '"Lord, to whom shall we go? You have the words of eternal life." Peter is responding to Jesus\'s question after many disciples had left. He acknowledges that Jesus\'s teaching is hard — he doesn\'t pretend it isn\'t — but he recognizes that no alternative offers what Jesus offers. It is faith by elimination as much as by conviction. Both are real faith.' },
      { q: 'Is it okay to stay in faith through doubt?', a: 'Yes — and Peter\'s answer in John 6 models exactly this. He is not claiming certainty in that moment. He is claiming that the alternatives are worse. Doubt and commitment can coexist in mature faith. The discipline is to keep showing up, keep engaging, keep asking the questions honestly within the relationship rather than walking away from it.' },
    ],
    related: [
      { href: 'song-still-my-god-2026-07-31.html', title: 'Song: Still My God' },
      { href: 'song-come-back-to-me-2026-07-19.html', title: 'Song: Come Back to Me' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'song-still-you-hold-me-2026-07-07.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Isaiah 41:10', text: '"So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand."', explanation: 'Four declarations, each adding depth: I am with you. I am your God. I will strengthen and help you. I will uphold you. The final one — uphold — suggests bearing weight, not just accompanying.' },
        { ref: 'Jude 24', text: '"To him who is able to keep you from stumbling and to present you before his glorious presence without fault and with great joy."', explanation: 'The keeping is God\'s work. "Still you hold me" is the worshipping recognition of a security that does not depend on the singer\'s own grip.' },
        { ref: 'John 10:28-29', text: '"I give them eternal life, and they shall never perish; no one will snatch them out of my hand... no one can snatch them out of my Father\'s hand."', explanation: 'Jesus says it twice for emphasis: no one snatches them from my hand, no one from my Father\'s. The security is doubled. The hold is God\'s, not ours.' },
      ]
    },
    reflection: `<p>The theology of divine holding runs through the entire Bible as one of its most consistent and comforting threads. From Moses's assurance to Joshua ("the Lord your God goes with you; he will never leave you nor forsake you") to Paul's confidence in Philippians ("he who began a good work in you will carry it on to completion"), the pattern is the same: the securing work belongs to God.</p>
<p>This matters because the alternative — a security that depends on the strength of our faith, the consistency of our devotion, the quality of our spiritual performance — is not actually secure at all. Anyone who has been a Christian for more than a year knows that faith has seasons, that devotion wavers, that spiritual vitality is not constant. If the hold depends on those things, the hold is fragile.</p>
<p>John 10:28-29 says it so clearly that the emphasis has to be intentional: "no one will snatch them out of my hand" — and then, as if anticipating the objection that this could fail, Jesus adds: "no one can snatch them out of my Father's hand." Doubled. The hold is not conditional on spiritual performance. It is the grip of the one who does not let go.</p>
<p>If you are in a season where you feel your own grip slipping — where faith feels thin, devotion feels hollow, and you're not sure you're holding on at all — this song is the reminder that the hold is not yours. It never was. The security of "still you hold me" is a declaration of what God is doing even when you can't feel your own part of it.</p>`,
    faqs: [
      { q: 'What does "perseverance of the saints" mean?', a: 'A theological term from Reformed Christianity describing the belief that those truly belonging to God will persevere in faith to the end — not because of their own strength, but because God\'s grip on them is the operative force. It is grounded in passages like John 10:28-29 and Jude 24. The emphasis is on God\'s faithfulness, not human performance.' },
      { q: 'What if I feel like I\'m losing my faith?', a: 'Tell God exactly that. The feeling of losing faith is not the same as actually losing it — faith often feels most fragile precisely when it is being tested and deepened. The very act of saying "God, I feel like I\'m losing this" is itself an act of faith. And consider: who are you saying it to? You are still addressing Him. The hold may be more secure than it feels.' },
    ],
    related: [
      { href: 'song-even-now-you-hold-2026-07-22.html', title: 'Song: Even Now You Hold' },
      { href: 'song-even-here-2026-07-25.html', title: 'Song: Even Here' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
    ]
  },

  // ── REMAINING SCRIPTURE PAGES ─────────────────────────────────────────────

  {
    file: 'jeremiah-29-11-plans-future-2026-07-08.html',
    scripture: {
      heading: 'Jeremiah 29:11 in Full Context',
      verses: [
        { ref: 'Jeremiah 29:10-11', text: '"When seventy years are completed for Babylon, I will come to you and fulfill my good promise to bring you back to this place. For I know the plans I have for you..."', explanation: 'The promise comes with a timeline: seventy years. Most of the people hearing it would not live to see it fulfilled. Context changes everything about what this verse asks of the believer.' },
        { ref: 'Jeremiah 29:4-7', text: '"Build houses and settle down; plant gardens... seek the peace and prosperity of the city to which I have carried you into exile. Pray to the Lord for it."', explanation: 'The immediate instruction before the famous verse: build a life in exile. Invest in the place you did not choose. This is what trusting God\'s plans actually looks like in practice — faithful presence in a hard present, not passive waiting for a better future.' },
        { ref: 'Romans 8:28', text: '"And we know that in all things God works for the good of those who love him."', explanation: 'The New Testament parallel to Jeremiah 29:11. Both promises are about God\'s active working toward good — and both require patience with a process that is not immediately visible.' },
      ]
    },
    reflection: `<p>Jeremiah 29:11 is one of the most frequently quoted Bible verses, and one of the most frequently misapplied. It appears on graduation cards, hospital waiting room wall art, and Christian inspirational content as a personal promise that God has a good future planned specifically for you — meaning that things will work out the way you hope, that your circumstances will improve, that your plans will succeed.</p>
<p>The people who first heard this verse were sitting in Babylon. They had been deported from their homeland. The temple — the center of their religious and national identity — had been destroyed. God's word to them through Jeremiah was not "things are about to get better" but "this will last seventy years. Build a life here. Pray for this place." The promise of plans for a future and a hope was not a short-term assurance. For most of the people in that room, it was a promise they would die without seeing fulfilled.</p>
<p>That does not make the verse less meaningful — it makes it more. A promise that holds across seventy years of exile, across the deaths of those who first heard it, across everything that happened to God's people between the deportation and the return — that is a more durable promise than a career guidance assurance. It is a promise about the character of God and the ultimate direction of history, not about your specific timeline.</p>
<p>Applied honestly, Jeremiah 29:11 is an invitation to faithful presence in difficult circumstances — to build your life, pray for your city, raise your family, invest in your community — even when the place you are is not the place you wanted to be. That is what hope in God's plans actually looks like in practice.</p>`,
    faqs: [
      { q: 'Was Jeremiah 29:11 written specifically for me?', a: 'It was written to the Israelites in Babylonian exile, not to modern individual Christians. However, the character of God it reveals — one who holds long-term purposes for His people even in exile — does speak to us today. The application is not "God promises your specific plans will succeed" but "God is at work for the ultimate good of those who belong to Him, even in circumstances that look like failure."' },
      { q: 'What are the "plans" God has in Jeremiah 29:11?', a: 'The Hebrew word for "plans" (machashavot) means thoughts, intentions, purposes. God\'s plans here refer to His ultimate purpose for His people — restoration, return, shalom. The verse is less about individual life plans and more about God\'s sovereign purpose for His covenant community. Applied to individuals, it means God has not abandoned you to your circumstances; He is actively purposing something good, even if the timeline is long.' },
      { q: 'How do I trust God\'s plans when my life isn\'t going the way I hoped?', a: 'By separating your trust from your circumstances. The Israelites in Babylon were told to build and plant and pray — to live faithfully in the hard present, not to passively wait for the good future. Trusting God\'s plans looks like faithful action in the place you actually are, not paralysis waiting for a better place. What does faithfulness look like in your current exile?' },
    ],
    related: [
      { href: 'jeremiah-29-11-more-than-a-promise-2026-07-26.html', title: 'Jeremiah 29:11 — More Than a Promise for Your Plans' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'psalm-88-when-god-goes-silent-2026-07-16.html',
    scripture: {
      heading: 'The Full Weight of Psalm 88',
      verses: [
        { ref: 'Psalm 88:1-2', text: '"Lord, you are the God who saves me; day and night I cry out to you. May my prayer come before you; turn your ear to my cry."', explanation: 'The psalm opens with a paradox: crying out to the God who saves, while experiencing no salvation. The address itself — "you are the God who saves me" — is a declaration of faith made in the absence of any evidence of it.' },
        { ref: 'Psalm 88:13-14', text: '"But I cry to you for help, Lord; in the morning my prayer comes before you. Why, Lord, do you reject me and hide your face from me?"', explanation: 'The morning prayer. Not once, but again. The psalmist keeps showing up even while accusing God of hiding. That persistence is itself a form of faith.' },
        { ref: 'Psalm 88:18', text: '"You have taken from me friend and neighbor — darkness is my closest friend."', explanation: 'The final line of the psalm. No resolution. No praise. Just darkness. God kept this prayer exactly as it is. That is an answer of a kind.' },
      ]
    },
    reflection: `<p>Psalm 88 is the only psalm in the entire collection that ends without resolution. Every other lament — and there are many — eventually turns toward praise, trust, or at minimum a statement of continued hope. Psalm 88 ends in darkness. "Darkness is my closest friend." That is the last line, and then silence.</p>
<p>Its presence in Scripture is itself a theological statement. God preserved this prayer. He did not require it to have a happy ending before including it in the book of worship. The unresolved lament has a place in the canon. Your unresolved lament has a place before God.</p>
<p>The psalmist is identified in the heading as Heman the Ezrahite — a musician, likely someone whose vocation was leading others in worship. The person who was supposed to be facilitating encounters with God was himself experiencing God's silence. This is not rare. Many of the most effective ministers, counselors, and spiritual directors have seasons of profound desolation. The vocational commitment to pointing others toward God does not exempt anyone from the experience of the dark.</p>
<p>What the psalmist does throughout is refuse to leave. "Day and night I cry out to you... morning my prayer comes before you." The complaint is addressed to God. The accusation is addressed to God. The darkness is brought to God. That is the model Psalm 88 offers: when you cannot praise, when you cannot feel, when you cannot see any resolution — keep showing up. Keep addressing Him. The cry itself is the prayer.</p>`,
    faqs: [
      { q: 'Why doesn\'t Psalm 88 end with hope like other psalms?', a: 'Biblical scholars debate this, but the most pastoral interpretation is that God preserved this psalm precisely because not all experiences of Him resolve neatly. Some seasons of spiritual darkness are long. Some prayers go unanswered in the timeframe the pray-er can see. Including Psalm 88 in Scripture validates that experience. Faith does not require resolution before it is faith.' },
      { q: 'What do I do when God feels completely absent?', a: 'Keep talking to Him — even if what you say is an accusation or a complaint. Psalm 88 models this throughout. The psalmist addresses God directly with "why do you reject me?" That is not faithlessness; it is the most intimate kind of engagement — bringing the hardest truth directly to the only one who can ultimately answer it. Stay in the conversation.' },
      { q: 'Is it spiritually healthy to dwell in lament?', a: 'Lament is healthy and biblical when it is honest and directed toward God rather than away from Him. The psalms use lament not as spiritual stagnation but as honest engagement with reality within a relationship. If lament becomes a permanent residence rather than a passage — if it moves from honest cry to settled despair with no desire for God — that may warrant conversation with a pastor or counselor.' },
    ],
    related: [
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'song-even-in-the-dark-2026-07-10.html', title: 'Song: Even in the Dark' },
    ]
  },

  {
    file: 'lamentations-3-22-23-mercies-new-every-morning-2026-07-20.html',
    scripture: {
      heading: 'Lamentations 3:22-23 in Full Context',
      verses: [
        { ref: 'Lamentations 3:19-20', text: '"I remember my affliction and my wandering, the bitterness and the gall. I well remember them, and my soul is downcast within me."', explanation: 'These are the verses immediately before the famous ones. The declaration of God\'s mercy comes from someone whose soul is downcast, who is actively remembering bitterness. The hope that follows is not naive.' },
        { ref: 'Lamentations 3:22-23', text: '"Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness."', explanation: 'The author does not say things got better. He says: given what is happening, we should be consumed — and we are not. That is the miracle. The mercies are not the absence of trouble but the survival of it.' },
        { ref: 'Lamentations 3:26', text: '"It is good to wait quietly for the salvation of the Lord."', explanation: 'The conclusion drawn from the new-every-morning mercy: patient, quiet waiting. Not passive despair, but active hope grounded in God\'s unchanging character.' },
      ]
    },
    reflection: `<p>Lamentations is a book of sustained, agonized grief over the destruction of Jerusalem. It is not an uplifting book. It opens with "How deserted lies the city, once so full of people" and proceeds through five chapters of mourning that are among the most visceral in Scripture. Lamentations 3:22-23 — the famous verse about mercies new every morning — appears not in spite of this context but because of it.</p>
<p>The author of Lamentations, writing in the immediate aftermath of catastrophic loss, looks at the rubble and says: we are not consumed. Given what has happened, given how bad this is, given that we deserved worse — we are not consumed. That is the starting point of "great is thy faithfulness." Not triumph. Not restoration. Just: we survived, and that survival is evidence of mercy.</p>
<p>This matters for how we sing the famous hymn based on this passage. "Great Is Thy Faithfulness" is not a song of success or blessing. It is a song of survival. It is the declaration of someone standing in ruins, looking at the evidence that they are still standing at all, and recognizing that as a gift. "All I have needed Thy hand hath provided" — not everything I wanted, not the circumstances I prayed for, but what I needed to survive. That has been given.</p>
<p>New every morning. Each day is a new allocation of mercy. Not carried over from yesterday, not depleted by yesterday's failures — fresh. That is the theological shape of the promise. Whatever you did yesterday, whatever was not resolved, whatever grief you are carrying from seasons past — this morning's mercy is new. You start again.</p>`,
    faqs: [
      { q: 'What is the context of "mercies new every morning"?', a: 'Lamentations 3:22-23 is written in the middle of a book mourning the destruction of Jerusalem and the exile of its people. The author is writing from a place of genuine catastrophic loss, not from comfort. The declaration that mercies are new every morning is all the more powerful for that context — it is hope found in ruins, not in blessing.' },
      { q: 'What does it mean that God\'s mercies are "new every morning"?', a: 'It means God\'s compassion is not a finite resource that can be exhausted by your failures or circumstances. Each day begins with a fresh supply. You do not carry forward a deficit from yesterday\'s failures, and you do not get to bank yesterday\'s mercies for tomorrow. Today\'s needs are met by today\'s mercy. That is both humbling and extraordinarily freeing.' },
      { q: 'How do I experience God\'s mercy when I feel like I don\'t deserve it?', a: 'That is precisely the situation mercy is designed for. Mercy by definition is given to those who don\'t deserve it. Lamentations 3 is written by someone who acknowledges "the Lord is righteous, for I rebelled against his command" (1:18) — and then discovers that His compassions still do not fail. Your sense of unworthiness is not a barrier to God\'s mercy. It is the accurate description of why mercy is necessary.' },
    ],
    related: [
      { href: 'psalm-88-when-god-goes-silent-2026-07-16.html', title: 'Psalm 88 — When God Goes Silent' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
      { href: 'jeremiah-29-11-more-than-a-promise-2026-07-26.html', title: 'Jeremiah 29:11 — More Than a Promise for Your Plans' },
    ]
  },

  {
    file: 'romans-8-28-all-things-work-together-2026-07-11.html',
    scripture: {
      heading: 'Romans 8:28 — Getting It Right',
      verses: [
        { ref: 'Romans 8:28', text: '"And we know that in all things God works for the good of those who love him, who have been called according to his purpose."', explanation: 'The promise is about God\'s working, not about all things being good. The distinction is critical: bad things are still bad. God works through them, not by making them not-bad.' },
        { ref: 'Romans 8:29', text: '"For those God foreknew he also predestined to be conformed to the image of his Son."', explanation: 'The verse immediately following defines the "good" of 8:28: becoming more like Christ. This is a long-term, costly, magnificent purpose — not comfort or success or answered prayer in the short term.' },
        { ref: 'Genesis 50:20', text: '"You intended to harm me, but God intended it for good."', explanation: 'Joseph\'s statement after years of slavery and imprisonment. The most vivid illustration of Romans 8:28 in the Old Testament: evil intentions, divine redirection, eventual good. The timeline was not short.' },
      ]
    },
    reflection: `<p>Romans 8 is one of the most theologically dense and spiritually sustaining chapters in the New Testament. It moves from the freedom from condemnation in Christ (8:1), through the work of the Spirit (8:5-17), the groaning of creation (8:18-25), the Spirit's intercession (8:26-27), to the famous promise of 8:28, and then climaxes in the declaration of nothing separating us from God's love (8:38-39). To read 8:28 in isolation is to miss its place in that arc.</p>
<p>Paul is writing about a world in which creation itself groans under the weight of what went wrong (8:22). He is writing about weakness so profound that "we do not know what we ought to pray for" (8:26). He is writing about hope for what cannot yet be seen (8:24). Romans 8:28 lands in that context — not as a promise that hard things will stop happening, but as a promise that God's working is happening simultaneously with them.</p>
<p>The Greek word synergei (works together) is active and ongoing. Not "worked" — past tense, implying resolution — but "works," present continuous. God's working is happening right now, in your current situation, toward an end you may not yet see. Joseph could not have told you the end of his story on day one in the pit. He could only tell it after Egypt. The perspective of Romans 8:28 is often only available in retrospect — but it is available, and it is real.</p>`,
    faqs: [
      { q: 'Does Romans 8:28 mean God causes bad things to happen?', a: 'No. Romans 8:28 says God works through all things — it does not say He causes all things. Scripture distinguishes between God\'s permissive will (things He allows) and His active will (things He causes). God does not cause evil; He redeems it. That is a very different claim, and an important one.' },
      { q: 'What does Romans 8:28 promise for someone going through tragedy?', a: 'It promises that God is actively at work, right now, in your situation — working toward an ultimate good that you may not be able to see from where you are standing. It does not promise that pain will end quickly, that you will understand what is happening, or that the outcome will look the way you hope. It promises that God has not stepped out of the room. He is working.' },
    ],
    related: [
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'philippians-4-13-never-about-what-you-can-do-2026-08-05.html', title: 'Philippians 4:13 — It Was Never About What You Can Do' },
    ]
  },

  {
    file: 'philippians-4-13-i-can-do-all-things-2026-07-23.html',
    scripture: {
      heading: 'Philippians 4:13 — The Real Promise',
      verses: [
        { ref: 'Philippians 4:12-13', text: '"I know what it is to be in need, and I know what it is to have plenty... I can do all this through him who gives me strength."', explanation: 'The "all this" refers to the circumstances Paul just named: need and plenty, hunger and abundance. Christ\'s strength enables endurance and contentment in all of these — not the achievement of unlimited goals.' },
        { ref: 'Philippians 4:7', text: '"And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus."', explanation: 'The promise just verses before: peace that guards, that transcends circumstances. Philippians 4 is about interior stability in exterior instability — not about capability.' },
        { ref: '2 Corinthians 12:10', text: '"For when I am weak, then I am strong."', explanation: 'Paul\'s clearest statement of his theological posture: strength that comes through weakness, not strength that eliminates weakness. Philippians 4:13 belongs in this same framework.' },
      ]
    },
    reflection: `<p>Philippians is Paul's most joyful letter — and he wrote it from prison. That context alone should recalibrate our understanding of every promise in it. When Paul says "I have learned to be content in all circumstances" (4:11), he is not describing a life of comfortable circumstances. He is describing a practiced inner stability that has been developed through imprisonment, beatings, shipwreck, and hardship of every kind.</p>
<p>Philippians 4:13 grows out of that. "I can do all things through Christ who strengthens me" is Paul describing his capacity to endure, adapt, and remain at peace whether in abundance or in need. It is a verse about resilience, not capability. About endurance, not achievement. About a heart that is not destroyed by circumstances because it is anchored in something that circumstances cannot reach.</p>
<p>The misapplication of this verse in motivational contexts is not harmless. When athletes and entrepreneurs quote it to mean "I can achieve anything with enough faith," they implicitly suggest that failure reveals insufficient faith. The person whose business fails, whose health does not improve, whose career does not advance as hoped — are they failing to access Philippians 4:13 correctly? That is a cruel implication, and it is not what Paul wrote.</p>
<p>The real promise is actually more broadly accessible and more truly sustaining: whatever your circumstances today — whether good or hard, whether you have plenty or nothing — Christ's strength is available to you for the thing you are actually in, right now. That is enough.</p>`,
    faqs: [
      { q: 'Can Christians achieve anything they believe for?', a: 'No — this is a misreading of verses like Philippians 4:13 and Matthew 17:20. These verses address specific things: Paul\'s ability to endure any circumstance, faith that trusts God in impossible situations. They are not promises of unlimited personal achievement. Plenty of faithful Christians experience failure, illness, and loss. Faith is not a guarantee of particular outcomes.' },
      { q: 'What does Philippians 4:13 actually promise?', a: 'Strength to endure, adapt, and maintain interior peace in any circumstance — whether that means suffering gracefully or receiving blessing without becoming attached to it. The promise is about contentment and endurance through Christ, not about accomplishing any goal you set. It is a promise about character and stability, not about outcomes.' },
    ],
    related: [
      { href: 'philippians-4-13-never-about-what-you-can-do-2026-08-05.html', title: 'Philippians 4:13 — It Was Never About What You Can Do' },
      { href: 'romans-8-28-all-things-work-together-2026-07-11.html', title: 'Romans 8:28 — All Things Work Together' },
      { href: 'prayer-for-staying-sober-2026-07-17.html', title: 'A Prayer for Those Fighting to Stay Sober' },
    ]
  },

  {
    file: 'song-you-know-me-still-2026-08-07.html',
    scripture: {
      heading: 'The Scripture Behind This Song',
      verses: [
        { ref: 'Psalm 139:1-4', text: '"You have searched me, Lord, and you know me. You know when I sit and when I rise; you perceive my thoughts from afar. You discern my going out and my lying down; you are familiar with all my ways."', explanation: 'The most thorough description of divine knowledge in Scripture. God\'s knowing is complete, active, and intimate — not surveillance but the knowledge of deep relationship.' },
        { ref: '1 Corinthians 13:12', text: '"For now we see only a reflection as in a mirror; but then I shall know fully, even as I am fully known."', explanation: 'Paul places being fully known as the eschatological condition — what eternity will feel like. To be fully known and loved is the destination. The song is a taste of that now.' },
        { ref: 'John 10:14', text: '"I am the good shepherd; I know my sheep and my sheep know me."', explanation: 'Knowing is mutual and relational. Jesus knows His sheep — specifically, individually — and they know Him. The knowing is not clinical; it is the knowing of a shepherd who calls each sheep by name (10:3).' },
      ]
    },
    reflection: `<p>To be fully known is one of the deepest human longings — and one of the deepest human fears. We want someone who sees us completely, past the performances and the pretenses, and chooses to stay. And we are terrified that such a person, if they existed, would not stay once they saw everything.</p>
<p>Psalm 139 describes a God who has already done the seeing. "You have searched me and known me" — past tense, complete. You are not performing for an audience that hasn't yet seen behind the curtain. The curtain is already gone. God sees the thoughts from afar, the words before they are spoken, the going out and lying down. The complete picture. And the psalm is not a description of judgment. It is a love song.</p>
<p>The "still" in "you know me still" is doing important work. Still — after everything I have done, after all the ways I have failed to be who I thought I would be, after the prayers unanswered and the faith that has thinned and the long stretches where I did not show up — still you know me. Still the knowledge is present, current, active. Not what you knew of me at my best; what you know of me now, exactly as I am today.</p>
<p>That is the beginning of a real relationship with God rather than a performed one: the freedom to be known as you actually are, in whatever condition you are actually in, without the requirement to first clean yourself up for the encounter. You are already seen. You are already known. The question is only whether you will stop hiding.</p>`,
    faqs: [
      { q: 'Does God really know everything about me?', a: 'Yes, according to Psalm 139. He knows your thoughts, your words before you speak them, your ways, and your days. This can feel uncomfortable — and also profoundly freeing. You cannot surprise God with the worst version of yourself. He already sees it, and He is still here.' },
      { q: 'How do I pray when I feel like God can\'t accept what He knows about me?', a: 'Remember that He already knows it. You are not informing God of your failures — you are choosing to stop hiding from what He can already see. That choice, to stop hiding and come into honest relationship, is exactly what prayer is. Start with: "You know me. You see all of it. And I\'m here anyway." That is a complete and faithful prayer.' },
    ],
    related: [
      { href: 'song-where-can-i-go-2026-07-15.html', title: 'Song: Where Can I Go' },
      { href: 'prayer-for-lost-identity-2026-07-27.html', title: 'A Prayer for When You\'ve Lost Yourself' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

];

function buildScriptureSection(scripture) {
  const verses = scripture.verses.map(v => `<div style="border-left:3px solid #7A9E7E;padding:12px 16px;margin-bottom:20px;background:#f9f7f4;border-radius:0 8px 8px 0;"><p style="font-weight:700;color:#2c1f14;margin:0 0 6px;">${v.ref}</p><p style="font-style:italic;color:#5a4a3a;margin:0 0 10px;">${v.text}</p><p style="font-size:0.92rem;color:#555;margin:0;">${v.explanation}</p></div>`).join('');
  return `\n<div class="prayer-card" style="margin-top:32px;">\n  <h2 style="font-size:1.2rem;color:#2c1f14;margin-bottom:20px;">${scripture.heading}</h2>\n  ${verses}\n</div>`;
}
function buildReflectionSection(reflection) {
  return `\n<div class="prayer-card" style="background:#f9f7f4;margin-top:16px;">\n  <h2 style="font-size:1.1rem;color:#7A9E7E;margin-bottom:16px;">Going Deeper</h2>\n  ${reflection}\n</div>`;
}
function buildFaqSection(faqs) {
  const items = faqs.map(faq => `<div style="border-bottom:1px solid #e8e0d5;padding:16px 0;"><h3 style="font-size:1rem;color:#2c1f14;margin:0 0 8px;">${faq.q}</h3><p style="font-size:0.93rem;color:#555;margin:0;">${faq.a}</p></div>`).join('');
  const schemaItems = faqs.map(faq => ({"@type":"Question","name":faq.q,"acceptedAnswer":{"@type":"Answer","text":faq.a}}));
  return `\n<div class="prayer-card" style="margin-top:16px;">\n  <h2 style="font-size:1.2rem;color:#2c1f14;margin-bottom:4px;">Frequently Asked Questions</h2>\n  ${items}\n</div>\n<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":schemaItems})}<\/script>`;
}
function buildRelatedSection(related) {
  const links = related.map(r => `<a href="${r.href}" style="display:block;padding:12px 16px;border:1px solid #e8e0d5;border-radius:8px;text-decoration:none;color:#2c1f14;font-weight:600;font-size:0.92rem;margin-bottom:10px;">${r.title} →</a>`).join('');
  return `\n<div class="prayer-card" style="margin-top:16px;">\n  <h2 style="font-size:1.1rem;color:#2c1f14;margin-bottom:16px;">Continue Reading</h2>\n  ${links}\n</div>`;
}

let processed = 0, skipped = 0;
const urlsToIndex = [];

for (const expansion of EXPANSIONS) {
  const filepath = path.join(SITE_DIR, expansion.file);
  if (!fs.existsSync(filepath)) { console.log(`SKIP (not found): ${expansion.file}`); skipped++; continue; }
  let html = fs.readFileSync(filepath, 'utf8');
  if (html.includes('Frequently Asked Questions') && html.includes('Going Deeper')) { console.log(`SKIP (already expanded): ${expansion.file}`); skipped++; continue; }
  const injection = buildScriptureSection(expansion.scripture) + buildReflectionSection(expansion.reflection) + buildFaqSection(expansion.faqs) + buildRelatedSection(expansion.related);
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
