// flows.js
// Predefined flows following the exact step sequences you provided.
// Replace each "selectors" array entries with the real selectors you capture (xpath:..., css:..., text:...).

module.exports = {
  profileSets: [
    // ProfileSet1
    {
      id: "ProfileSet1",
      name: "Profile Set 1",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile", "text:Report"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Problem involving someone under 18 → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images"] },
        { label: "Submit", selectors: ["text:Submit", "xpath://button[contains(.,'Submit')]"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options (again)", selectors: ["text:See Options"] },
        { label: "Report Profile (again)", selectors: ["text:Report Profile"] },
        { label: "Something about this page (again)", selectors: ["text:Something about this page"] },

        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Violent, hateful or disturbing content → Calling for violence", selectors: ["text:Calling for violence"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Adult content → Seems like prostitution", selectors: ["text:Seems like prostitution"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Fake profile → They’re not a real person", selectors: ["text:They’re not a real person", "text:Fake profile"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    },

    // ProfileSet2
    {
      id: "ProfileSet2",
      name: "Profile Set 2",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Problem involving someone under 18 → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Bullying, harassment or abuse → Bullying or harassment — I don't know them", selectors: ["text:Bullying or harassment", "text:I don't know them"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Violent, hateful or disturbing content → Showing violence, death or severe injury", selectors: ["text:Showing violence", "text:severe injury", "text:death"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Adult content → Nudity or sexual activity", selectors: ["text:Nudity", "text:sexual activity"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Fake profile → They’re not a real person", selectors: ["text:They’re not a real person", "text:Fake profile"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    },

    // ProfileSet3
    {
      id: "ProfileSet3",
      name: "Profile Set 3",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Problem involving someone under 18 → Sharing someone’s nude images", selectors: ["text:Sharing someone’s nude images", "text:sharing nude"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Bullying, harassment or abuse → Seems like human trafficking", selectors: ["text:human trafficking", "text:trafficking"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Violent, hateful or disturbing content → Seems like organised crime", selectors: ["text:organised crime", "text:organized crime"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Adult content → Seems like sexual exploitation", selectors: ["text:sexual exploitation"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "Fake profile → They’re not a real person", selectors: ["text:They’re not a real person", "text:Fake profile"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    },

    // ProfileSet4
    {
      id: "ProfileSet4",
      name: "Profile Set 4",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Problem involving someone under 18 → Physical abuse", selectors: ["text:Physical abuse", "text:self-harm"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Bullying, harassment or abuse → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images", "text:threat to share"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Violent, hateful or disturbing content → Promoting hate - Posting hateful speech", selectors: ["text:Promoting hate", "text:hateful speech"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Adult content → My nude images have been shared", selectors: ["text:My nude images have been shared", "text:images have been shared"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Fake profile → Impersonation / fake identity", selectors: ["text:Impersonation", "text:fake identity", "text:Fake profile"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    },

    // ProfileSet5
    {
      id: "ProfileSet5",
      name: "Profile Set 5",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Problem involving someone under 18 → Grooming or sexual approach", selectors: ["text:Grooming", "text:sexual approach"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Bullying, harassment or abuse → Harassment / repeated abuse", selectors: ["text:Harassment", "text:repeated abuse"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Violent, hateful or disturbing content → Calls for organised crime (Credible threat)", selectors: ["text:Credible threat to safety", "text:calls for organised crime"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Profile", selectors: ["text:Report Profile"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Adult content → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images"] },
        { label: "Fake profile → Using stolen photos / catfishing", selectors: ["text:Using stolen photos", "text:catfish", "text:Fake profile"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    }
  ],


  pageSets: [
    // PageSet1
    {
      id: "PageSet1",
      name: "Page Set 1",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Page", selectors: ["text:Report Page", "text:Report"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Problem involving someone under 18 → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Page", selectors: ["text:Report Page"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Page", selectors: ["text:Report Page"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Violent, hateful or disturbing content → Calling for violence", selectors: ["text:Calling for violence"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Page", selectors: ["text:Report Page"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Adult content → Seems like prostitution", selectors: ["text:Seems like prostitution"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Page", selectors: ["text:Report Page"] },
        { label: "Something about this page", selectors: ["text:Something about this page"] },

        { label: "Fake page → They’re not a real page/business/person", selectors: ["text:They’re not a real person", "text:Fake page"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    },

    // ----- PageSet2 -----
{
  id: "PageSet2",
  name: "Page Set 2",
  steps: [
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Problem involving someone under 18 → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Bullying, harassment or abuse → Bullying or harassment — I don't know them", selectors: ["text:I don't know them"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Violent, hateful or disturbing content → Showing violence, death or severe injury", selectors: ["text:death", "text:severe injury"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Adult content → Nudity or sexual activity", selectors: ["text:Nudity", "text:sexual activity"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Fake page → They’re not a real person", selectors: ["text:They’re not a real person"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},

    // ----- PageSet3 -----
{
  id: "PageSet3",
  name: "Page Set 3",
  steps: [
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Problem involving someone under 18 → Sharing someone’s nude images", selectors: ["text:Sharing someone’s nude images"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Bullying, harassment or abuse → Seems like human trafficking", selectors: ["text:human trafficking"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Violent, hateful or disturbing content → Seems like organised crime", selectors: ["text:organised crime"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Adult content → Seems like sexual exploitation", selectors: ["text:sexual exploitation"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Fake page → They’re not a real person", selectors: ["text:They’re not a real person"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},
    // ----- PageSet4 -----
{
  id: "PageSet4",
  name: "Page Set 4",
  steps: [
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Problem involving someone under 18 → Physical abuse", selectors: ["text:Physical abuse"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Bullying, harassment or abuse → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Violent, hateful or disturbing content → Promoting hate - Posting hateful speech", selectors: ["text:hateful speech"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Adult content → My nude images have been shared", selectors: ["text:My nude images have been shared"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Fake page → They’re not a real person", selectors: ["text:They’re not a real person"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},
    // ----- PageSet5 -----
{
  id: "PageSet5",
  name: "Page Set 5",
  steps: [
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Problem involving someone under 18 → Bullying or harassment", selectors: ["text:Bullying or harassment"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Violent, hateful or disturbing content → Credible threat to safety", selectors: ["text:Credible threat to safety"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Adult content → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Page", selectors: ["text:Report Page"] },
    { label: "Something about this page", selectors: ["text:Something about this page"] },

    { label: "Fake page → They’re not a real person", selectors: ["text:They’re not a real person"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},


  postSets: [
    // PostSet1
    {
      id: "PostSet1",
      name: "Post Set 1",
      steps: [
        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Post", selectors: ["text:Report post", "text:Report"] },

        { label: "Problem involving someone under 18 → Threatening to share my nude images", selectors: ["text:Threatening to share my nude images"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Post", selectors: ["text:Report post"] },

        { label: "Bullying, harassment or abuse → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Post", selectors: ["text:Report post"] },

        { label: "Violent, hateful or disturbing content → Calling for violence", selectors: ["text:Calling for violence"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] },

        { label: "See Options", selectors: ["text:See Options"] },
        { label: "Report Post", selectors: ["text:Report post"] },

        { label: "Adult content → Seems like prostitution", selectors: ["text:Seems like prostitution"] },
        { label: "Submit", selectors: ["text:Submit"] },
        { label: "Next", selectors: ["text:Next"] },
        { label: "Done", selectors: ["text:Done"] }
      ]
    },

    // PostSet2
{
  id: "PostSet2",
  name: "Post Set 2",
  steps: [
    // Report 1
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post", "text:Something about this"] },

    { label: "Problem involving someone under 18 → Seems like sexual exploitation", selectors: ["text:Seems like sexual exploitation", "text:sexual exploitation"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 2
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Bullying / harassment → Bullying or harassment — I don't know them", selectors: ["text:I don't know them", "text:Bullying or harassment"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 3
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Violent, hateful or disturbing content → Showing violence, death or severe injury", selectors: ["text:death", "text:severe injury", "text:Shows violence"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 4
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Adult content → Nudity or sexual activity", selectors: ["text:Nudity", "text:sexual activity"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},

// PostSet3
{
  id: "PostSet3",
  name: "Post Set 3",
  steps: [
    // Report 1
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Nudity → Sexual exploitation / trafficking hint", selectors: ["text:traffick", "text:sexual exploitation", "text:trafficking"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 2
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Harassment → Organized harassment / doxxing", selectors: ["text:doxx", "text:doxing", "text:dox", "text:organized harassment"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 3
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Hate speech → Insults inciting others", selectors: ["text:hate", "text:dehumanize", "text:insult", "text:incite"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 4
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Spam → Phishing / money request", selectors: ["text:phishing", "text:money request", "text:phish", "text:spam"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},

// PostSet4
{
  id: "PostSet4",
  name: "Post Set 4",
  steps: [
    // Report 1
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Nudity → My images posted without consent", selectors: ["text:without consent", "text:my images", "text:posted without consent"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 2
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Harassment → Stalking / repeated contact", selectors: ["text:stalking", "text:repeated contact"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 3
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Violent → Graphic injury / corpse images", selectors: ["text:corpse", "text:graphic", "text:graphic injury"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
},

// PostSet5
{
  id: "PostSet5",
  name: "Post Set 5",
  steps: [
    // Report 1
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Nudity → Sexual content mixed with minors / exploitation", selectors: ["text:minor", "text:sexual", "text:underage", "text:exploitation"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 2
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Harassment → Impersonation + harassment", selectors: ["text:impersonation", "text:impersonate", "text:harassment"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 3
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Violent/hate → Organised crime promotion / extremist content", selectors: ["text:organised crime", "text:extremist", "text:terrorism"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] },

    // Report 4
    { label: "See Options", selectors: ["text:See Options"] },
    { label: "Report Post", selectors: ["text:Report post", "text:Report"] },
    { label: "Something about this post", selectors: ["text:Something about this post"] },

    { label: "Spam → Clickbait / malicious link", selectors: ["text:clickbait", "text:malicious link", "text:link to scam"] },
    { label: "Submit", selectors: ["text:Submit"] },
    { label: "Next", selectors: ["text:Next"] },
    { label: "Done", selectors: ["text:Done"] }
  ]
}
