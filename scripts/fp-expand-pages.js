#!/usr/bin/env node
/**
 * Faithful Passages — Page Content Expander
 * Expands all content pages to 1,500w+ by injecting:
 *   - Scripture section (2-3 verses with explanation)
 *   - Expanded reflection (3-4 paragraphs)
 *   - FAQ section with FAQPage schema
 *   - Related content links
 * 
 * Run: node fp-expand-pages.js
 */

'use strict';
const fs = require('fs');
const path = require('path');

const SITE_DIR = path.join(__dirname, '../sites/faithfulpassages.com');
const SITE_URL = 'https://faithfulpassages.com';

// IndexNow key
const INDEXNOW_KEY = 'b4f7e2a1c3d5e6f7a8b9c0d1e2f3a4b5';

// Per-page expansion content
// Each entry: { file, scripture, reflection, faqs, related }
const EXPANSIONS = [

  {
    file: 'prayer-for-loneliness-2026-07-21.html',
    scripture: {
      heading: 'What the Bible Says About Loneliness',
      verses: [
        { ref: 'Psalm 88:18', text: '"You have taken from me friend and neighbor — darkness is my closest friend."', explanation: 'This is the darkest psalm in the Bible. It ends with no resolution, no tidy comfort — just the honest cry of someone alone in the dark. And it is in Scripture. God preserved this prayer because your loneliness is not too dark to bring to Him.' },
        { ref: 'Isaiah 41:10', text: '"So do not fear, for I am with you; do not be dismayed, for I am your God."', explanation: 'God does not say the loneliness will end immediately. He says He is there inside it. His promise is not to remove you from the dark room but to enter it with you.' },
        { ref: '1 Kings 19:4-5', text: '"I have had enough, Lord," he said. "Take my life." ... Then he lay down under the bush and fell asleep. All at once an angel touched him and said, "Get up and eat."', explanation: 'Elijah, one of the greatest prophets in the Old Testament, collapsed under a tree in exhausted loneliness and asked to die. God\'s response was not a sermon. It was sleep, food, and a gentle touch. Sometimes that is what presence looks like.' },
      ]
    },
    reflection: `<p>Loneliness has a particular cruelty when it lives inside a busy life. It is easier, in some ways, to be alone in a visible sense — when the calendar is empty and the house is quiet. But many people reading this prayer are surrounded by people and still feel it: the sense of being unknown, of performing rather than living, of wondering whether anyone sees the real version of them.</p>
<p>The Christian tradition does not pretend this away. Some of the loneliest figures in Scripture were the most faithful — Job stripped of everything, Paul writing from a Roman prison, Jesus himself crying out from the cross: "My God, my God, why have you forsaken me?" These are not failures of faith. They are the honest shape of a life lived in a broken world that has not yet been fully restored.</p>
<p>What makes Christian loneliness different is not that it hurts less, but that it is never technically true. The promise "I will never leave you nor forsake you" (Hebrews 13:5) is either the most important sentence in human history or it means nothing at all. Faith is choosing to treat it as the former even when every feeling argues otherwise.</p>
<p>If you prayed this prayer today, you are not weak. You are honest. That honesty is the beginning of the kind of intimacy with God that comfortable, untroubled people rarely find. The mystics called it the dark night of the soul — and they described it not as God's absence but as His way of drawing near in ways the noise of ordinary life makes impossible to hear.</p>`,
    faqs: [
      { q: 'Is it a sin to feel lonely as a Christian?', a: 'No. Loneliness is not a failure of faith — it is a feature of being human in a world not yet fully redeemed. Jesus himself experienced profound aloneness in Gethsemane and on the cross. Feeling lonely does not mean God has abandoned you; it often means you are longing for the kind of deep connection that will only be fully satisfied in eternity.' },
      { q: 'What does the Bible say about feeling alone?', a: 'The Bible is remarkably honest about loneliness. Psalms 88, 22, and 42 all express deep feelings of isolation and God\'s silence. Elijah, Job, Jeremiah, and Paul all wrote from places of profound loneliness. God did not erase their loneliness immediately — He met them in it, often through rest, food, community, and the quiet assurance of His presence.' },
      { q: 'How do I pray when I feel too lonely to pray?', a: 'Start exactly where you are. The shortest honest prayer — "God, I feel alone and I need you" — is a complete prayer. You do not need to feel God\'s presence to reach toward it. The Psalms are full of prayers that begin in desolation and end still waiting. That is not failure; that is faith.' },
      { q: 'Can church make loneliness worse?', a: 'Yes, and many people experience exactly this. Being surrounded by people who seem to have vibrant community and faith while you feel invisible can intensify the ache. If this describes you, you are not alone in that experience. It is worth naming it honestly to God and, when you are ready, to one trusted person — a pastor, counselor, or friend who can handle the truth of where you are.' },
    ],
    related: [
      { href: 'prayer-for-lost-identity-2026-07-27.html', title: 'A Prayer for When You\'ve Lost Yourself' },
      { href: 'prayer-for-exhausted-caregiver-2026-08-06.html', title: 'A Prayer for the Exhausted Caregiver' },
      { href: 'psalm-88-when-god-goes-silent-2026-07-16.html', title: 'Psalm 88 — When God Goes Silent' },
    ]
  },

  {
    file: 'prayer-for-exhausted-caregiver-2026-08-06.html',
    scripture: {
      heading: 'Scripture for the Exhausted Caregiver',
      verses: [
        { ref: 'Matthew 11:28-30', text: '"Come to me, all you who are weary and burdened, and I will give you rest."', explanation: 'Jesus did not say "push harder" or "you signed up for this." He said come. The caregiver who is running on empty is exactly the person this invitation was written for.' },
        { ref: 'Isaiah 40:31', text: '"But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint."', explanation: 'The progression matters: soar, then run, then walk. Sometimes renewal does not feel like soaring. Sometimes it is just being able to keep walking. That counts.' },
        { ref: 'Galatians 6:9', text: '"Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up."', explanation: 'Paul wrote this to people who were tired of doing the right thing with no visible result. The caregiver who tends to someone who cannot say thank you, who may not even know they are there — this verse is for you.' },
      ]
    },
    reflection: `<p>Caregiving is one of the most Christlike things a human being can do and one of the least celebrated. To give your days — and often your nights — to someone who needs constant tending, who may not be able to express gratitude, who may not improve despite your best efforts, is a kind of love that costs everything and often goes unseen by the world.</p>
<p>The exhaustion caregivers carry is not just physical. It is the weight of grief for the person who is still present but diminished. It is the loneliness of a life that has contracted around a single demanding need. It is the guilt of the moments when resentment flickers — because it does, for every caregiver, and that does not make you a bad person. It makes you human.</p>
<p>Jesus rested. He withdrew from the crowds. He slept in the back of the boat during a storm — a detail so human and so intentional that it must be there for a reason. Rest is not a failure of devotion. It is a prerequisite for it. If you are reading this prayer and you cannot remember the last time you slept through the night or had an hour to yourself, that is not sustainable, and God is not asking you to pretend otherwise.</p>
<p>One of the most neglected verses in caregiving conversations is from the story of Elijah: before God gave him a mission, He gave him sleep and bread. Twice. The angel did not say "get back to work." The angel said "get up and eat, the journey is too much for you." Your journey may feel too much for you right now. That is the honest starting place for receiving help — from God, from others, from yourself.</p>`,
    faqs: [
      { q: 'How do I pray when I\'m too tired to feel anything spiritually?', a: 'Pray exactly that. "God, I am too tired to feel anything and I need you to be enough right now." A prayer does not need to be felt to be heard. The Spirit intercedes for us "with groans that words cannot express" (Romans 8:26) — meaning God receives what you cannot articulate. Show up empty. That is enough.' },
      { q: 'Is caregiver burnout a spiritual failure?', a: 'No. Burnout is a physiological and psychological reality, not a character flaw. Even the most devoted biblical figures hit walls — Moses needed Jethro to tell him to delegate, Elijah collapsed and asked to die. Acknowledging your limits is wisdom, not weakness. Seeking help is stewardship of the body and mind God gave you.' },
      { q: 'What does the Bible say about caring for the sick and elderly?', a: 'Scripture consistently honors those who tend to the vulnerable. Proverbs 17:6 and 1 Timothy 5:8 speak to family responsibility. But the Bible also shows God providing for those who give — Elijah fed by ravens, the widow\'s oil that did not run out. Caregiving is holy work, and God sees it even when no one else does.' },
      { q: 'How do I find time for God when caregiving takes everything?', a: 'Start smaller than you think you need to. One honest sentence in the morning. One psalm before bed. God does not require long quiet times from people who have none to give. He meets us in the margins. Many caregivers find that brief, honest, repeated prayers through the day — "Help me," "Thank you," "I can\'t do this alone" — become more sustaining than scheduled devotions they cannot keep.' },
    ],
    related: [
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'prayer-for-lost-identity-2026-07-27.html', title: 'A Prayer for When You\'ve Lost Yourself' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
    ]
  },

  {
    file: 'prayer-for-miscarriage-grief-2026-08-03.html',
    scripture: {
      heading: 'Scripture for Pregnancy Loss and Grief',
      verses: [
        { ref: 'Psalm 34:18', text: '"The Lord is close to the brokenhearted and saves those who are crushed in spirit."', explanation: 'This verse does not say God will fix it quickly or explain it clearly. It says He is close — specifically to the brokenhearted. Loss this intimate is exactly the kind of grief this promise was written to address.' },
        { ref: 'Jeremiah 1:5', text: '"Before I formed you in the womb I knew you, before you were born I set you apart."', explanation: 'God knew this child before any human eye saw them. The life you grieve was known and named by God. That is not a small thing. It is the ground on which many grieving parents find their footing again.' },
        { ref: 'John 11:35', text: '"Jesus wept."', explanation: 'The shortest verse in the Bible, and one of the most important. Jesus — standing at the tomb of Lazarus, knowing He was about to raise him — still wept. He weeps with you now. Your grief does not need to be managed or resolved before He will be present with you.' },
      ]
    },
    reflection: `<p>Miscarriage grief is one of the most isolating kinds of loss because so much of the world does not know how to hold it. The baby was real to you — completely, entirely real — before anyone outside your closest circle knew they existed. And then the loss happened, often quietly, and the world kept moving as if nothing significant had occurred. That gap between what you experienced and what the world acknowledged is its own kind of wound.</p>
<p>There is no grief hierarchy in Scripture. God does not weigh your loss against others' and decide how much comfort to allocate. The same God who mourned with Mary and Martha at Lazarus's tomb, who heard Hannah's silent desperate prayer for a child, who recorded Jeremiah's lament word for word — that God hears this grief. All of it. Even the parts you haven't been able to say out loud yet.</p>
<p>One of the hardest parts of pregnancy loss is the love that had nowhere to go. You prepared a place in your heart — and maybe in your home — for this child. You thought about the name. You imagined the face. You began, even if briefly, to be a parent. That love did not die when the pregnancy ended. It is still there, looking for somewhere to land. There is no rush to redirect it. Letting yourself grieve the full weight of what was lost — not just the pregnancy but the future, the relationship, the person they would have become — is not morbid. It is honest. And God can hold all of it.</p>
<p>If you are wondering whether it is okay to be this sad about a loss this early — yes. It is. The length of a pregnancy does not determine the depth of the love. You are not overreacting. You are a parent whose child is gone, and that deserves to be grieved fully and without apology.</p>`,
    faqs: [
      { q: 'Does God see babies lost to miscarriage?', a: 'Yes. Jeremiah 1:5 tells us God knows and forms each person before birth. Psalm 139:13-16 speaks of God knitting us together in our mother\'s womb and recording our days before one of them came to be. Many Christians believe, and Scripture supports, that every life — however brief — is known and held by God.' },
      { q: 'How do I grieve a miscarriage as a Christian?', a: 'The same way you grieve anything: honestly, without a timeline, and with permission to feel the full weight of it. The Psalms of lament are your model — raw, unfiltered grief brought directly to God without dressing it up. You do not have to be at peace yet. You do not have to "trust God\'s plan" before you are ready. Grief is not the opposite of faith.' },
      { q: 'Why does God allow miscarriage?', a: 'This is one of the hardest questions in faith, and there is no complete answer this side of eternity. What Scripture offers is not an explanation but a presence: God is close to the brokenhearted (Psalm 34:18), He holds what we cannot hold, and He promises that in eternity every sorrow will be fully redeemed (Revelation 21:4). That does not make the grief smaller now. But it means this loss is not the final word.' },
      { q: 'Is it okay to be angry at God after a miscarriage?', a: 'Yes. Bringing anger to God is an act of relationship, not disrespect. The Psalms are full of people who demanded answers, accused God of forgetting them, and expressed raw rage at their circumstances. God did not rebuke them for it — He preserved their words in Scripture for thousands of years. Your anger is safe with Him.' },
    ],
    related: [
      { href: 'prayer-for-infertile-heart-2026-07-09.html', title: 'A Prayer for the Longing Heart' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
    ]
  },

  {
    file: 'prayer-for-financial-shame-2026-07-30.html',
    scripture: {
      heading: 'What the Bible Says About Financial Shame',
      verses: [
        { ref: 'Philippians 4:11-12', text: '"I have learned, in whatever state I am, to be content... I know how to be abased, and I know how to abound."', explanation: 'Paul wrote this from prison, having experienced both wealth and poverty. Contentment, he says, is learned — not a gift you either have or don\'t. And critically, it does not mean pretending financial hardship doesn\'t hurt.' },
        { ref: 'Luke 16:13', text: '"No one can serve two masters... You cannot serve both God and money."', explanation: 'Jesus spoke about money more than almost any other topic. Not to shame those without it, but to free those who fear it — in either direction. The goal is not poverty or wealth; it is not letting money define your identity or worth.' },
        { ref: 'Proverbs 19:17', text: '"Whoever is kind to the poor lends to the Lord, and he will reward them for what they have done."', explanation: 'God pays attention to financial hardship. The poor are not invisible to Him; they are on His ledger. Your need, whatever it is, is seen.' },
      ]
    },
    reflection: `<p>Financial shame is one of the most insidious kinds because it attaches itself to your sense of worth as a person, a parent, a spouse, a provider. In a culture that quietly equates success with virtue, to struggle financially is to feel like you have somehow failed morally — not just practically. That is a lie, but it is a very convincing one.</p>
<p>Scripture presents a far more complicated picture of wealth and poverty than Western Christianity often teaches. The same Bible that includes wealthy Abraham also includes the widow who gave her last two coins and was praised by Jesus. The same God who blessed Solomon with riches also told the rich young ruler to give it all away. What Scripture consistently refuses to do is use money as a measure of faithfulness or God's favor. "He causes his sun to rise on the evil and the good, and sends rain on the righteous and the unrighteous" (Matthew 5:45).</p>
<p>If you are carrying financial shame today, it is worth separating the shame from the practical problem. The practical problem may require budgets, counsel, hard conversations, and time. But the shame — the part that says you are worth less as a human being because of your financial situation — that part is a lie that does not survive contact with the gospel. You were bought at a price that had nothing to do with your bank account.</p>
<p>Many of the most significant figures in the New Testament were poor by any standard — fishermen, tax collectors, a carpenter's family that could only afford doves for the temple offering instead of a lamb. Jesus himself had no place to lay his head. Financial struggle does not disqualify you from God's blessing or attention. It may, in fact, be one of the places where you discover His provision most concretely.</p>`,
    faqs: [
      { q: 'Does financial struggle mean God is punishing me?', a: 'No. This is one of the most harmful theological misunderstandings, sometimes called "prosperity gospel." Jesus directly addressed it when his disciples asked whose sin caused a man\'s blindness (John 9:3) — "Neither this man nor his parents sinned." Financial hardship is not evidence of God\'s punishment or absence of blessing.' },
      { q: 'How do I pray about money without feeling greedy?', a: 'Honestly. Jesus told us to ask for "our daily bread" — a very practical, material request. There is nothing spiritually wrong with bringing financial need to God directly. The issue is not asking for provision but making wealth the goal of your life rather than a resource in it. Pray for what you need. God invites it.' },
      { q: 'What does the Bible say about debt?', a: 'Scripture acknowledges debt as a reality of life (Romans 13:8 encourages paying debts; Proverbs 22:7 notes the practical burden of being a borrower) without treating it as a moral failure. The goal is stewardship, not shame. If you are in debt, the biblical path is practical wisdom — seek counsel, make a plan, move forward — not self-condemnation.' },
      { q: 'Is it okay to ask God for financial help?', a: 'Yes, absolutely. Philippians 4:6 says to present every request to God. Matthew 7:11 promises that God gives good gifts to those who ask. Elijah was fed by ravens. The widow\'s oil did not run out. God is not above practical provision. Bring your need to Him directly and specifically.' },
    ],
    related: [
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'prayer-for-staying-sober-2026-07-17.html', title: 'A Prayer for Those Fighting to Stay Sober' },
      { href: 'philippians-4-13-never-about-what-you-can-do-2026-08-05.html', title: 'Philippians 4:13 — It Was Never About What You Can Do' },
    ]
  },

  {
    file: 'prayer-for-lost-identity-2026-07-27.html',
    scripture: {
      heading: 'Scripture for When You\'ve Lost Yourself',
      verses: [
        { ref: 'Isaiah 43:1', text: '"Do not fear, for I have redeemed you; I have summoned you by name; you are mine."', explanation: 'God\'s knowledge of you is not dependent on your knowledge of yourself. When your sense of who you are has eroded, His naming of you has not. You are known before you know yourself.' },
        { ref: 'Psalm 139:13-14', text: '"For you created my inmost being; you knit me together in my mother\'s womb. I praise you because I am fearfully and wonderfully made."', explanation: 'Your identity was established before you had any capacity to perform, produce, or achieve. The self God made is not the one you have to construct through effort — it is the one He knit together deliberately.' },
        { ref: '2 Corinthians 5:17', text: '"Therefore, if anyone is in Christ, the new creation has come: The old has gone, the new is here!"', explanation: 'Identity in Christ is not about finding your old self again — it is about discovering a self that was never entirely yours to begin with. Loss of self can be the painful beginning of a truer self.' },
      ]
    },
    reflection: `<p>There is a particular kind of disorientation that comes when you realize you no longer know who you are. It can happen gradually — through years of caregiving, a long marriage that reshaped you, a career that consumed you, or a grief that changed everything. Or it can happen suddenly: a diagnosis, a divorce, a move, a failure that reframes your whole story. Either way, the ground beneath your sense of self has shifted, and you are left standing in what used to be your life, feeling like a stranger in it.</p>
<p>The Christian answer to this is counterintuitive: your identity was never really yours to begin with. This sounds frightening until you understand what it means. The "self" we construct through achievement, relationships, reputation, and roles is real but fragile — it depends on things that can be taken away. The self God sees and names is prior to all of that. "Before I formed you in the womb I knew you" (Jeremiah 1:5). You were known before you had a chance to become anyone in particular.</p>
<p>This means that losing yourself — losing the version of you that was propped up by circumstances, roles, or performance — is not the end of your story. It can be the beginning of discovering who you actually are beneath all of that. This is painful. It is disorienting. But it is not the same as being lost. It is being found by someone who knew you before you lost yourself.</p>
<p>If you are in this season, be patient with the process. Identity reconstruction after a significant loss of self is not a weekend project. It happens in small moments: a conversation that felt real, a small thing that brought unexpected joy, a sentence in a prayer that made you feel briefly like yourself again. Those small moments are not nothing. They are the threads God uses to weave a truer version of you than the one you lost.</p>`,
    faqs: [
      { q: 'Is it a spiritual problem to not know who I am?', a: 'Not inherently. Many of the greatest saints and mystics describe periods of profound self-loss as precursors to deeper self-understanding. John of the Cross wrote about the "dark night of the soul" — a stripping away of false selves that feels like loss but is actually preparation. What feels like a spiritual problem may be spiritual surgery.' },
      { q: 'What does the Bible say about identity?', a: 'Scripture grounds identity in relationship with God rather than in achievement or role. You are made in God\'s image (Genesis 1:27), known before birth (Jeremiah 1:5), named and claimed (Isaiah 43:1), and called a new creation in Christ (2 Corinthians 5:17). None of these identities depend on your current circumstances or how you feel about yourself today.' },
      { q: 'How do I find myself again after a major life change?', a: 'Slowly, and with help. Practically: reconnect with things you loved before the change, even small ones. Rebuild one relationship that feels real and safe. Talk to a counselor or spiritual director. Ask God to show you who He sees when He looks at you. Identity reconstruction takes time — give yourself the same patience you would give a friend.' },
      { q: 'Can losing your identity be part of God\'s plan?', a: 'Yes. The pattern in Scripture is often: stripping, then building. Jacob wrestled with God and came away limping but renamed. Moses fled into the desert and came back transformed. Paul was blinded before he could see clearly. The losses that feel like destruction are sometimes the very thing that makes space for something more durable to grow.' },
    ],
    related: [
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'psalm-22-1-when-god-feels-silent-2026-08-02.html', title: 'Psalm 22 — When God Feels Silent' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
    ]
  },

  {
    file: 'prayer-for-parent-of-prodigal-2026-07-24.html',
    scripture: {
      heading: 'Scripture for Parents of Prodigal Children',
      verses: [
        { ref: 'Luke 15:20', text: '"But while he was still a long way off, his father saw him and was filled with compassion for him; he ran to his son."', explanation: 'The father in Jesus\'s parable was watching. He ran. Before the son finished his rehearsed apology. This is the image Jesus chose to show us what God is like — and what love looks like when a child comes home.' },
        { ref: 'Jeremiah 29:11', text: '"For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future."', explanation: 'This verse was written to people in exile — people far from where they should be, far from home. God had not abandoned them in Babylon. He has not abandoned your child either.' },
        { ref: 'Lamentations 3:22-23', text: '"Because of the Lord\'s great love we are not consumed, for his compassions never fail. They are new every morning."', explanation: 'Every morning is a new start. The story is not over. As long as your child is alive, mercy is still available to them, and hope is still available to you.' },
      ]
    },
    reflection: `<p>There is a grief unique to parents of prodigal children that sits in a strange place between mourning and hope. You are grieving someone who is still alive — grieving the relationship as it was, the future you imagined, perhaps the faith they once held. And yet hope will not entirely release you, because they are still here, still potentially reachable, still the child you raised. This in-between place is exhausting to live in for any length of time.</p>
<p>The parable of the prodigal son is Jesus's longest parable, and it is told from the father's perspective as much as the son's. The father does not chase the son down. He does not send emissaries. He waits — actively, watchfully, positioned to see the son while he is still "a long way off." That kind of waiting is not passive resignation. It is an act of sustained love and sustained hope. It is also one of the hardest things a parent can do.</p>
<p>What the parable does not give you is a timeline. The son "came to himself" at some point — but when? After days, months, years in the far country? Scripture does not say. What it does say is that when he came home, the father was still there, still watching. Your faithfulness to that position — to watching and waiting and not abandoning hope — is not wasted, even when it produces no visible results.</p>
<p>If you are a parent praying this prayer today, you are in one of the hardest seats a believer can occupy. Let yourself grieve fully. Let yourself be angry if you are angry. Let yourself doubt and question and wonder why. All of that is allowed inside the house of faith. What the father in the parable did not do was stop being the father. Neither do you have to stop being you — loving, praying, watching, hoping — to survive this season.</p>`,
    faqs: [
      { q: 'What does the Bible say about prodigal children?', a: 'The most direct passage is Luke 15:11-32, the parable of the prodigal son. Jesus tells it to show God\'s heart toward those who wander and return. The father in the story represents God — watching, waiting, running, celebrating. The parable is less about the prodigal and more about the father\'s love that never stopped.' },
      { q: 'How do I pray for a child who has left the faith?', a: 'Honestly and specifically. Name what you see. Ask God to pursue them, to place people in their path, to use their circumstances to create openings for return. Pray for their wellbeing even when you disagree with their choices. And pray for yourself — for the grief, the patience, the ability to love without controlling.' },
      { q: 'Should I cut off a prodigal child?', a: 'This is deeply personal and depends on the specific situation — especially if addiction, abuse, or serious harm is involved. The parable neither endorses enabling nor cutting off; the father let the son go and kept the door open. Healthy boundaries and sustained love are not opposites. Seek wise counsel from a pastor or counselor who knows your specific situation.' },
      { q: 'How do I keep my faith when my child has rejected theirs?', a: 'This is one of the most faith-testing experiences a believer faces. Be honest with God about your struggle. Find community with others who have walked this road — there are support groups specifically for parents of prodigals. Do not let your child\'s departure become your own. Your faith is your own, even when theirs is in crisis.' },
    ],
    related: [
      { href: 'prayer-for-the-estranged-2026-07-12.html', title: 'A Prayer for the Estranged' },
      { href: 'prayer-for-loneliness-2026-07-21.html', title: 'A Prayer for the Loneliness No One Sees' },
      { href: 'romans-8-28-not-everything-is-good-2026-07-29.html', title: 'Romans 8:28 — Not a Promise That Everything Is Good' },
    ]
  },

];

// ── HTML builder ───────────────────────────────────────────────────────────────

function buildScriptureSection(scripture) {
  const verses = scripture.verses.map(v => `
    <div style="border-left:3px solid #7A9E7E;padding:12px 16px;margin-bottom:20px;background:#f9f7f4;border-radius:0 8px 8px 0;">
      <p style="font-weight:700;color:#2c1f14;margin:0 0 6px;">${v.ref}</p>
      <p style="font-style:italic;color:#5a4a3a;margin:0 0 10px;">${v.text}</p>
      <p style="font-size:0.92rem;color:#555;margin:0;">${v.explanation}</p>
    </div>`).join('');
  return `
<div class="prayer-card" style="margin-top:32px;">
  <h2 style="font-size:1.2rem;color:#2c1f14;margin-bottom:20px;">${scripture.heading}</h2>
  ${verses}
</div>`;
}

function buildReflectionSection(reflection) {
  return `
<div class="prayer-card" style="background:#f9f7f4;margin-top:16px;">
  <h2 style="font-size:1.1rem;color:#7A9E7E;margin-bottom:16px;">Going Deeper</h2>
  ${reflection}
</div>`;
}

function buildFaqSection(faqs) {
  const items = faqs.map(faq => `
    <div style="border-bottom:1px solid #e8e0d5;padding:16px 0;">
      <h3 style="font-size:1rem;color:#2c1f14;margin:0 0 8px;">${faq.q}</h3>
      <p style="font-size:0.93rem;color:#555;margin:0;">${faq.a}</p>
    </div>`).join('');

  const schemaItems = faqs.map(faq => ({
    "@type": "Question",
    "name": faq.q,
    "acceptedAnswer": { "@type": "Answer", "text": faq.a }
  }));

  return `
<div class="prayer-card" style="margin-top:16px;">
  <h2 style="font-size:1.2rem;color:#2c1f14;margin-bottom:4px;">Frequently Asked Questions</h2>
  ${items}
</div>
<script type="application/ld+json">${JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":schemaItems})}</script>`;
}

function buildRelatedSection(related) {
  const links = related.map(r => `
    <a href="${r.href}" style="display:block;padding:12px 16px;border:1px solid #e8e0d5;border-radius:8px;text-decoration:none;color:#2c1f14;font-weight:600;font-size:0.92rem;margin-bottom:10px;transition:background 0.15s;" onmouseover="this.style.background='#f9f7f4'" onmouseout="this.style.background=''">${r.title} →</a>`).join('');
  return `
<div class="prayer-card" style="margin-top:16px;">
  <h2 style="font-size:1.1rem;color:#2c1f14;margin-bottom:16px;">Continue Reading</h2>
  ${links}
</div>`;
}

// ── Main ───────────────────────────────────────────────────────────────────────

let processed = 0;
let skipped = 0;
const urlsToIndex = [];

for (const expansion of EXPANSIONS) {
  const filepath = path.join(SITE_DIR, expansion.file);
  if (!fs.existsSync(filepath)) {
    console.log(`SKIP (not found): ${expansion.file}`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filepath, 'utf8');

  // Skip if already expanded (idempotent check)
  if (html.includes('Frequently Asked Questions') && html.includes('Going Deeper')) {
    console.log(`SKIP (already expanded): ${expansion.file}`);
    skipped++;
    continue;
  }

  // Build the injection block
  const injection =
    buildScriptureSection(expansion.scripture) +
    buildReflectionSection(expansion.reflection) +
    buildFaqSection(expansion.faqs) +
    buildRelatedSection(expansion.related);

  // Insert before the email section
  if (html.includes('<div class="email-section">')) {
    html = html.replace('<div class="email-section">', injection + '\n<div class="email-section">');
  } else if (html.includes('</section>')) {
    html = html.replace('</section>', injection + '\n</section>');
  } else {
    console.log(`WARN: no injection point found for ${expansion.file}`);
    skipped++;
    continue;
  }

  fs.writeFileSync(filepath, html, 'utf8');

  // Word count check
  const words = html.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`✓ ${expansion.file} — ~${words}w`);

  urlsToIndex.push(`${SITE_URL}/${expansion.file}`);
  processed++;
}

console.log(`\nDone: ${processed} expanded, ${skipped} skipped.`);
console.log(`URLs to submit to IndexNow: ${urlsToIndex.length}`);

// ── IndexNow submission ────────────────────────────────────────────────────────
if (urlsToIndex.length > 0) {
  const https = require('https');
  const body = JSON.stringify({
    host: 'faithfulpassages.com',
    key: INDEXNOW_KEY,
    keyLocation: `https://faithfulpassages.com/${INDEXNOW_KEY}.txt`,
    urlList: urlsToIndex
  });

  const options = {
    hostname: 'api.indexnow.org',
    path: '/indexnow',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
  };

  const req = https.request(options, res => {
    console.log(`IndexNow: ${res.statusCode}`);
  });
  req.on('error', e => console.error('IndexNow error:', e.message));
  req.write(body);
  req.end();
}
