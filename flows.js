// flows.js
// Predefined flows for Profile / Page / Post
// Each step is now an object: { label, selectors: [ "xpath:...", "css:..." ], mandatory?: true/false }
// Replace the selector strings with the exact selectors you captured from mobile DOM.

module.exports = {
  profileSets: [
    {
      id: "ProfileSet1",
      name: "Profile Set 1",
      steps: [
        { label: "Open Options (See Options)", selectors: ["xpath://div[contains(@aria-label,'See Options') or contains(@aria-label,'More options')]", "css:div[aria-label*='See Options'], button[aria-label*='More']"], mandatory: true },
        { label: "Report Profile menu item", selectors: ["xpath://a[contains(translate(.,'REPORT','report'),'report') or contains(.,'Report')]", "css:a[href*='report'], button:contains('Report')"] },
        { label: "Choose 'Something about this page'", selectors: ["xpath://*[contains(.,'Something about this page') or contains(.,'Something about the profile')]", "css:div:contains('Something about')"], mandatory: true },
        { label: "Problem involving someone under 18 → Threatening to share my nude images", selectors: ["xpath://*[contains(.,'Problem involving someone under 18')]/following::button[contains(.,'Threatening to share') or contains(.,'nude')]", "xpath://*[contains(.,'Threatening to share') or contains(.,'nude images')]", "css:button:contains('Threatening to share')"], mandatory: false },
        { label: "Bullying/abuse → Seems like sexual exploitation", selectors: ["xpath://*[contains(.,'Bullying') and contains(.,'sexual')]", "css:label:contains('sexual exploitation')"], mandatory: false },
        { label: "Violent content → Calling for violence", selectors: ["xpath://*[contains(.,'Calling for violence') or contains(.,'violence')]", "css:label:contains('violence')"], mandatory: false },
        { label: "Adult content → Seems like prostitution", selectors: ["xpath://*[contains(.,'prostitution') or contains(.,'Adult content')]", "css:label:contains('prostitution')"], mandatory: false },
        { label: "Fake profile → They’re not a real person", selectors: ["xpath://*[contains(.,'not a real person') or contains(.,'Fake profile')]", "css:label:contains('not a real person')"], mandatory: false },
        { label: "Submit / Next / Done sequence (final)", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Next') or contains(.,'Done')]", "css:button[type='submit'], button:contains('Next'), button:contains('Done')"], mandatory: true }
      ]
    },

    {
      id: "ProfileSet2",
      name: "Profile Set 2",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Profile", selectors: ["xpath://a[contains(.,'Report') or contains(.,'Report profile')]", "css:a[href*='report']"], mandatory: true },
        { label: "Something about this page", selectors: ["xpath://*[contains(.,'Something about this page')]", "css:div:contains('Something about')"], mandatory: true },
        { label: "Problem under 18 → sexual exploitation", selectors: ["xpath://*[contains(.,'sexual exploitation') or contains(.,'exploitation')]", "css:label:contains('sexual exploitation')"] },
        { label: "Bullying/harassment → I don't know them", selectors: ["xpath://*[contains(.,\"I don't know them\") or contains(.,'I don')]", "css:label:contains(\"I don't know\")"] },
        { label: "Violent → Showing violence/death/severe injury", selectors: ["xpath://*[contains(.,'severe injury') or contains(.,'death') or contains(.,'graphic')]", "css:label:contains('severe injury')"] },
        { label: "Adult content → Nudity or sexual activity", selectors: ["xpath://*[contains(.,'Nudity') or contains(.,'sexual activity')]", "css:label:contains('Nudity')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Next') or contains(.,'Done')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },

    {
      id: "ProfileSet3",
      name: "Profile Set 3",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Profile", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Something about this page", selectors: ["xpath://*[contains(.,'Something about this page')]", "css:div:contains('Something about')"], mandatory: true },
        { label: "Under 18 → Sharing someone’s nude images", selectors: ["xpath://*[contains(.,'Sharing') and contains(.,'nude')]", "css:label:contains('nude images')"] },
        { label: "Bullying → Human trafficking", selectors: ["xpath://*[contains(.,'human trafficking') or contains(.,'traffick')]", "css:label:contains('trafficking')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Next')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },

    {
      id: "ProfileSet4",
      name: "Profile Set 4",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Profile", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Problem under 18 → Physical abuse / self-harm", selectors: ["xpath://*[contains(.,'Physical abuse') or contains(.,'self-harm')]", "css:label:contains('Physical abuse')"] },
        { label: "Bullying → Threats of violence", selectors: ["xpath://*[contains(.,'Threat') or contains(.,'violence')]", "css:label:contains('Threat')"] },
        { label: "Adult content → My nude images have been shared", selectors: ["xpath://*[contains(.,'My nude images') or contains(.,'images have been shared')]", "css:label:contains('images have been shared')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Done')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },

    {
      id: "ProfileSet5",
      name: "Profile Set 5",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Profile", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Problem under 18 → Grooming or sexual approach", selectors: ["xpath://*[contains(.,'Grooming') or contains(.,'sexual approach')]", "css:label:contains('Grooming')"] },
        { label: "Bullying → Harassment / repeated abuse", selectors: ["xpath://*[contains(.,'Harassment') or contains(.,'repeated abuse')]", "css:label:contains('Harassment')"] },
        { label: "Fake profile → Using stolen photos / catfishing", selectors: ["xpath://*[contains(.,'stolen photos') or contains(.,'catfish')]", "css:label:contains('stolen photos')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Done')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    }
  ],

  pageSets: [
    {
      id: "PageSet1",
      name: "Page Set 1",
      steps: [
        { label: "Open Page Options", selectors: ["xpath://div[contains(@aria-label,'See Options') or contains(@aria-label,'More')]", "css:div[aria-label*='See Options'], button[aria-label*='More']"], mandatory: true },
        { label: "Report Page", selectors: ["xpath://a[contains(.,'Report page') or contains(.,'Report Page') or contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Spam/scam → Fraud or scam", selectors: ["xpath://*[contains(.,'Fraud') or contains(.,'scam')]", "css:label:contains('scam')"] },
        { label: "Adult content → Nudity/sexual content", selectors: ["xpath://*[contains(.,'Nudity') or contains(.,'sexual')]", "css:label:contains('Nudity')"] },
        { label: "Violent content → Promoting violence", selectors: ["xpath://*[contains(.,'Promoting violence') or contains(.,'violence')]", "css:label:contains('violence')"] },
        { label: "Fake page → Pretending to be a business", selectors: ["xpath://*[contains(.,'pretending to be a business') or contains(.,'not a real business')]", "css:label:contains('not a real business')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Done')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    // PageSet2..5 (same pattern)
    {
      id: "PageSet2",
      name: "Page Set 2",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Page", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Sharing false information", selectors: ["xpath://*[contains(.,'false information') or contains(.,'misleading')]", "css:label:contains('misleading')"] },
        { label: "Adult content → prostitution", selectors: ["xpath://*[contains(.,'prostitution') or contains(.,'promote sexual')]", "css:label:contains('prostitution')"] },
        { label: "Violent → Shows severe injury/gore", selectors: ["xpath://*[contains(.,'gore') or contains(.,'severe injury')]", "css:label:contains('gore')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit') or contains(.,'Done')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PageSet3",
      name: "Page Set 3",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Page", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Spam / repeated unsolicited", selectors: ["xpath://*[contains(.,'Spam') or contains(.,'unsolicited')]", "css:label:contains('Spam')"] },
        { label: "Adult content → Underage sexual content", selectors: ["xpath://*[contains(.,'underage') or contains(.,'minor')]", "css:label:contains('underage')"] },
        { label: "Sale → Drug trafficking", selectors: ["xpath://*[contains(.,'drugs') or contains(.,'trafficking')]", "css:label:contains('drugs')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PageSet4",
      name: "Page Set 4",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Page", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Scam — asking money", selectors: ["xpath://*[contains(.,'asking money') or contains(.,'scam')]", "css:label:contains('asking money')"] },
        { label: "Nudity sexualizes minors", selectors: ["xpath://*[contains(.,'sexualizes minors') or contains(.,'sexualize')]", "css:label:contains('sexualize')"] },
        { label: "Fake page → Not a real business", selectors: ["xpath://*[contains(.,'Not a real business') or contains(.,'Not a real company')]", "css:label:contains('Not a real business')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PageSet5",
      name: "Page Set 5",
      steps: [
        { label: "Open Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Page", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Political misinformation", selectors: ["xpath://*[contains(.,'misinformation') or contains(.,'false news')]", "css:label:contains('misinformation')"] },
        { label: "Adult content → explicit sexual content for pay", selectors: ["xpath://*[contains(.,'for pay') or contains(.,'prostitution')]", "css:label:contains('for pay')"] },
        { label: "Fake page → impersonation", selectors: ["xpath://*[contains(.,'impersonation') or contains(.,'pretend to be')]", "css:label:contains('impersonation')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    }
  ],

  postSets: [
    {
      id: "PostSet1",
      name: "Post Set 1",
      steps: [
        { label: "Open Post Options", selectors: ["xpath://div[contains(@aria-label,'See Options') or contains(@data-action,'more')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Post", selectors: ["xpath://a[contains(.,'Report post') or contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Nudity → Sharing someone’s nude images", selectors: ["xpath://*[contains(.,'nude') and contains(.,'sharing')]", "css:label:contains('nude images')"] },
        { label: "Harassment → Bullying / sexual exploitation", selectors: ["xpath://*[contains(.,'Bullying') or contains(.,'exploitation')]", "css:label:contains('exploitation')"] },
        { label: "Violent content → Shows violence / gore", selectors: ["xpath://*[contains(.,'violence') or contains(.,'gore')]", "css:label:contains('gore')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PostSet2",
      name: "Post Set 2",
      steps: [
        { label: "Open Post Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Post", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Nudity → Underage sexual content", selectors: ["xpath://*[contains(.,'underage') or contains(.,'minor')]", "css:label:contains('underage')"] },
        { label: "Harassment → Threat to share images / blackmail", selectors: ["xpath://*[contains(.,'blackmail') or contains(.,'threat to share')]", "css:label:contains('blackmail')"] },
        { label: "Spam → Spam / link to scam", selectors: ["xpath://*[contains(.,'spam') or contains(.,'scam')]", "css:label:contains('spam')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PostSet3",
      name: "Post Set 3",
      steps: [
        { label: "Open Post Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Post", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Nudity → Sexual exploitation / trafficking hint", selectors: ["xpath://*[contains(.,'traffick') or contains(.,'sexual exploitation')]", "css:label:contains('trafficking')"] },
        { label: "Harassment → Organized harassment / doxxing", selectors: ["xpath://*[contains(.,'doxx') or contains(.,'doxing')]", "css:label:contains('doxx')"] },
        { label: "Hate speech → Insults inciting others", selectors: ["xpath://*[contains(.,'hate') or contains(.,'dehumanize')]", "css:label:contains('hate')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PostSet4",
      name: "Post Set 4",
      steps: [
        { label: "Open Post Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Post", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Nudity → My images posted without consent", selectors: ["xpath://*[contains(.,'without consent') or contains(.,'my images')]", "css:label:contains('without consent')"] },
        { label: "Harassment → Stalking / repeated contact", selectors: ["xpath://*[contains(.,'stalking') or contains(.,'repeated contact')]", "css:label:contains('stalking')"] },
        { label: "Violent → Graphic injury / corpse images", selectors: ["xpath://*[contains(.,'corpse') or contains(.,'graphic')]", "css:label:contains('corpse')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    },
    {
      id: "PostSet5",
      name: "Post Set 5",
      steps: [
        { label: "Open Post Options", selectors: ["xpath://div[contains(@aria-label,'See Options')]", "css:div[aria-label*='See Options']"], mandatory: true },
        { label: "Report Post", selectors: ["xpath://a[contains(.,'Report')]", "css:a[href*='report']"], mandatory: true },
        { label: "Nudity → Sexual content mixed with minors/exploitation", selectors: ["xpath://*[contains(.,'minor') and contains(.,'sexual')]", "css:label:contains('minor')"] },
        { label: "Harassment → Impersonation + harassment", selectors: ["xpath://*[contains(.,'impersonation') or contains(.,'impersonate')]", "css:label:contains('impersonation')"] },
        { label: "Spam → Clickbait / malicious link", selectors: ["xpath://*[contains(.,'clickbait') or contains(.,'malicious')]", "css:label:contains('clickbait')"] },
        { label: "Submit / Next / Done", selectors: ["xpath://button[contains(.,'Submit')]", "css:button:contains('Submit')"], mandatory: true }
      ]
    }
  ]
};
