// flows.js
// Manual flow definitions exactly as requested.
// IMPORTANT: selectors are placeholders "manual:..." — replace with real css:/xpath: values yourself.

module.exports = {
  profileSets: [
    {
      id: "ProfileSet1",
      name: "Profile Set 1",
      steps: [
        // Item 1
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile (menu)", selector: "manual:Report Profile - select" },
        { label: "Something about this page (choose)", selector: "manual:Something about this page" },
        { label: "Problem involving someone under 18 → Threatening to share my nude images", selector: "manual:Problem involving someone under 18 → Threatening to share my nude images" },
        { label: "Submit", selector: "manual:Submit" },
        { label: "Next", selector: "manual:Next" },
        { label: "Done", selector: "manual:Done" },

        // Item 2
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile (menu)", selector: "manual:Report Profile - select" },
        { label: "Something about this page (choose)", selector: "manual:Something about this page" },
        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selector: "manual:Bullying, harassment or abuse → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" },
        { label: "Next", selector: "manual:Next" },
        { label: "Done", selector: "manual:Done" },

        // Item 3
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile (menu)", selector: "manual:Report Profile - select" },
        { label: "Something about this page (choose)", selector: "manual:Something about this page" },
        { label: "Violent, hateful or disturbing content → Calling for violence", selector: "manual:Violent, hateful or disturbing content → Calling for violence" },
        { label: "Submit", selector: "manual:Submit" },
        { label: "Next", selector: "manual:Next" },
        { label: "Done", selector: "manual:Done" },

        // Item 4
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile (menu)", selector: "manual:Report Profile - select" },
        { label: "Something about this page (choose)", selector: "manual:Something about this page" },
        { label: "Adult content → Seems like prostitution", selector: "manual:Adult content → Seems like prostitution" },
        { label: "Submit", selector: "manual:Submit" },
        { label: "Next", selector: "manual:Next" },
        { label: "Done", selector: "manual:Done" },

        // Item 5
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile (menu)", selector: "manual:Report Profile - select" },
        { label: "Something about this page (choose)", selector: "manual:Something about this page" },
        { label: "Fake profile → They’re not a real person", selector: "manual:Fake profile → They’re not a real person" },
        { label: "Submit", selector: "manual:Submit" },
        { label: "Next", selector: "manual:Next" },
        { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "ProfileSet2",
      name: "Profile Set 2",
      steps: [
        // 1
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Problem involving someone under 18 → Seems like sexual exploitation", selector: "manual:Problem involving someone under 18 → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 2
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Bullying, harassment or abuse → Bullying or harassment — I don't know them", selector: "manual:Bullying, harassment or abuse → Bullying or harassment — I don't know them" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 3
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent, hateful or disturbing content → Showing violence, death or severe injury", selector: "manual:Violent, hateful or disturbing content → Showing violence, death or severe injury" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 4
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Nudity or sexual activity", selector: "manual:Adult content → Nudity or sexual activity" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 5
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake profile → They’re not a real person", selector: "manual:Fake profile → They’re not a real person" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "ProfileSet3",
      name: "Profile Set 3",
      steps: [
        // 1
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Problem involving someone under 18 → Sharing someone’s nude images", selector: "manual:Problem involving someone under 18 → Sharing someone’s nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 2
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Bullying, harassment or abuse → Seems like human trafficking", selector: "manual:Bullying, harassment or abuse → Seems like human trafficking" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 3
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent, hateful or disturbing content → Seems like organised crime", selector: "manual:Violent, hateful or disturbing content → Seems like organised crime" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 4
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Seems like sexual exploitation", selector: "manual:Adult content → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 5
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake profile → They’re not a real person", selector: "manual:Fake profile → They’re not a real person" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "ProfileSet4",
      name: "Profile Set 4",
      steps: [
        // 1
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Problem involving someone under 18 → Physical abuse", selector: "manual:Problem involving someone under 18 → Physical abuse" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 2
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Bullying, harassment or abuse → Threatening to share my nude images", selector: "manual:Bullying, harassment or abuse → Threatening to share my nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 3
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent, hateful or disturbing content → Promoting hate - Posting hateful speech", selector: "manual:Violent, hateful or disturbing content → Promoting hate - Posting hateful speech" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 4
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → My nude images have been shared", selector: "manual:Adult content → My nude images have been shared" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 5
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake profile → They’re not a real person", selector: "manual:Fake profile → They’re not a real person" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "ProfileSet5",
      name: "Profile Set 5",
      steps: [
        // 1
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Problem involving someone under 18 → Bullying or harassment", selector: "manual:Problem involving someone under 18 → Bullying or harassment" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 2
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selector: "manual:Bullying, harassment or abuse → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 3
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent, hateful or disturbing content → Credible threat to safety", selector: "manual:Violent, hateful or disturbing content → Credible threat to safety" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 4
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Threatening to share my nude images", selector: "manual:Adult content → Threatening to share my nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        // 5
        { label: "See Options (open)", selector: "manual:See Options - open" },
        { label: "Report Profile", selector: "manual:Report Profile - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake profile → They’re not a real person", selector: "manual:Fake profile → They’re not a real person" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    }
  ],


  pageSets: [
    // PageSet1 .. PageSet5 each with 5 items, each item uses See Options -> Report Page -> Something about this page -> reason -> Submit->Next->Done
    {
      id: "PageSet1",
      name: "Page Set 1",
      steps: [
        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Spam / scam / false info → Fraud or scam", selector: "manual:Spam / scam / false info → Fraud or scam" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Nudity / sexual content", selector: "manual:Adult content → Nudity / sexual content" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent content → Promoting violence", selector: "manual:Violent content → Promoting violence" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Sale of restricted items → Drugs (highly addictive)", selector: "manual:Sale of restricted items → Drugs (highly addictive)" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake page → Pretending to be a business", selector: "manual:Fake page → Pretending to be a business" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PageSet2",
      name: "Page Set 2",
      steps: [
        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Spam / scam / false info → Sharing false information", selector: "manual:Spam / scam / false info → Sharing false information" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Sexual content promoting prostitution", selector: "manual:Adult content → Sexual content promoting prostitution" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent content → Shows severe injury / gore", selector: "manual:Violent content → Shows severe injury / gore" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Sale of restricted items → Weapons selling", selector: "manual:Sale of restricted items → Weapons selling" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake page → Impersonation (public figure / brand)", selector: "manual:Fake page → Impersonation (public figure / brand)" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PageSet3",
      name: "Page Set 3",
      steps: [
        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Spam / repeated unsolicited", selector: "manual:Spam / repeated unsolicited" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Underage sexual content", selector: "manual:Adult content → Underage sexual content" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent content → Organised crime / recruitment", selector: "manual:Violent content → Organised crime / recruitment" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Sale of restricted items → Drug trafficking", selector: "manual:Sale of restricted items → Drug trafficking" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PageSet4",
      name: "Page Set 4",
      steps: [
        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Scam — asking money", selector: "manual:Scam — asking money" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Nudity that sexualizes minors", selector: "manual:Adult content → Nudity that sexualizes minors" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent content → Threatening physical harm", selector: "manual:Violent content → Threatening physical harm" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Fake page → Not a real business", selector: "manual:Fake page → Not a real business" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PageSet5",
      name: "Page Set 5",
      steps: [
        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Spam / scam / false info → Political misinformation (if applicable)", selector: "manual:Spam / scam / false info → Political misinformation (if applicable)" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Adult content → Explicit sexual content for pay", selector: "manual:Adult content → Explicit sexual content for pay" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open page)", selector: "manual:See Options - open page" },
        { label: "Report Page", selector: "manual:Report Page - select" },
        { label: "Something about this page", selector: "manual:Something about this page" },
        { label: "Violent content → Promoting terrorism", selector: "manual:Violent content → Promoting terrorism" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    }
  ],


  postSets: [
    {
      id: "PostSet1",
      name: "Post Set 1",
      steps: [
        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Problem involving someone under 18 → Threatening to share my nude images", selector: "manual:Problem involving someone under 18 → Threatening to share my nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selector: "manual:Bullying, harassment or abuse → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Violent, hateful or disturbing content → Calling for violence", selector: "manual:Violent, hateful or disturbing content → Calling for violence" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Adult content → Seems like prostitution", selector: "manual:Adult content → Seems like prostitution" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PostSet2",
      name: "Post Set 2",
      steps: [
        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Problem involving someone under 18 → Seems like sexual exploitation", selector: "manual:Problem involving someone under 18 → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Bullying, harassment or abuse → Bullying or harassment — I don't know them", selector: "manual:Bullying, harassment or abuse → Bullying or harassment — I don't know them" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Violent, hateful or disturbing content → Showing violence, death or severe injury", selector: "manual:Violent, hateful or disturbing content → Showing violence, death or severe injury" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Adult content → Nudity or sexual activity", selector: "manual:Adult content → Nudity or sexual activity" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PostSet3",
      name: "Post Set 3",
      steps: [
        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Problem involving someone under 18 → Sharing someone’s nude images", selector: "manual:Problem involving someone under 18 → Sharing someone’s nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Bullying, harassment or abuse → Seems like human trafficking", selector: "manual:Bullying, harassment or abuse → Seems like human trafficking" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Violent, hateful or disturbing content → Seems like organised crime", selector: "manual:Violent, hateful or disturbing content → Seems like organised crime" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Adult content → Seems like sexual exploitation", selector: "manual:Adult content → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PostSet4",
      name: "Post Set 4",
      steps: [
        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Problem involving someone under 18 → Physical abuse", selector: "manual:Problem involving someone under 18 → Physical abuse" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Bullying, harassment or abuse → Threatening to share my nude images", selector: "manual:Bullying, harassment or abuse → Threatening to share my nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Violent, hateful or disturbing content → Promoting hate - Posting hateful speech", selector: "manual:Violent, hateful or disturbing content → Promoting hate - Posting hateful speech" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Adult content → My images have been shared", selector: "manual:Adult content → My images have been shared" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    },

    {
      id: "PostSet5",
      name: "Post Set 5",
      steps: [
        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Problem involving someone under 18 → Bullying or harassment", selector: "manual:Problem involving someone under 18 → Bullying or harassment" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selector: "manual:Bullying, harassment or abuse → Seems like sexual exploitation" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Violent, hateful or disturbing content → Credible threat to safety", selector: "manual:Violent, hateful or disturbing content → Credible threat to safety" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" },

        { label: "See Options (open post)", selector: "manual:See Options - open post" },
        { label: "Report Post", selector: "manual:Report Post - select" },
        { label: "Adult content → Threatening to share my nude images", selector: "manual:Adult content → Threatening to share my nude images" },
        { label: "Submit", selector: "manual:Submit" }, { label: "Next", selector: "manual:Next" }, { label: "Done", selector: "manual:Done" }
      ]
    }
  ]
};
