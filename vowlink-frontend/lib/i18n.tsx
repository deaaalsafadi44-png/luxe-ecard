"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LanguageCode = "ar" | "en";

export type TranslationKey =
  | "language"
  | "switchLanguage"
  | "royalCollection"
  | "platformDescription"
  | "openAdminDashboard"
  | "openPlatformPortal"
  | "openCouplePortal"
  | "previewInvitationRoute"
  | "welcome"
  | "honoredGuest"
  | "dearGuest"
  | "venue"
  | "days"
  | "hours"
  | "minutes"
  | "seconds"
  | "rsvp"
  | "attendance"
  | "coming"
  | "notComing"
  | "pending"
  | "companions"
  | "saveRsvp"
  | "saving"
  | "rsvpUpdated"
  | "rsvpFailed"
  | "createInvitation"
  | "slug"
  | "coupleNames"
  | "weddingDate"
  | "venueName"
  | "venueAddress"
  | "mapsEmbedUrl"
  | "coverPhotoUpload"
  | "uploadFailed"
  | "guestName"
  | "addGuest"
  | "invitationCreated"
  | "invitationCreateFailed"
  | "rsvpDashboard"
  | "invitationSlug"
  | "loadStats"
  | "exportExcel"
  | "totalGuests"
  | "failedLoadDashboard"
  | "emailLabel"
  | "passwordLabel"
  | "adminInviteKeyLabel"
  | "adminInviteKeyHint"
  | "adminGateTitle"
  | "adminGateSubmit"
  | "adminGateInvalid"
  | "adminGateExit"
  | "signIn"
  | "signOut"
  | "platformLoginTitle"
  | "coupleLoginTitle"
  | "platformDashboardTitle"
  | "coupleDashboardTitle"
  | "invitationStatus"
  | "statusDraft"
  | "statusPublished"
  | "statusDisabled"
  | "coupleSelfRegistration"
  | "saveChanges"
  | "createCoupleAccountSection"
  | "createCoupleAccountBtn"
  | "coupleInviteSlug"
  | "accountCreatedSuccess"
  | "genericError"
  | "register"
  | "coupleEditIntro"
  | "platformIntro"
  | "invitationsHeading"
  | "noInvitationsYet"
  | "publicPreviewLink"
  | "invitationDashboardLink"
  | "invitationDashboardPageTitle"
  | "openPublicInvitation"
  | "invitationCreatedWithLinks"
  | "galleryPhotos"
  | "uploadGalleryPhotos"
  | "galleryUploadLimits"
  | "galleryMaxReached"
  | "remove"
  | "backToHome"
  | "initialStatus"
  | "allowCoupleSignup"
  | "invitationSaved"
  | "deleteInvitation"
  | "deleteInvitationConfirm"
  | "invitationDeleted"
  | "allowCreateInvitationCheckbox"
  | "inviteSource"
  | "coupleCreatedBadge"
  | "createYourInvitationTitle"
  | "guestLinksTitle"
  | "guestLinksExplain"
  | "copyGuestLink"
  | "guestLinkCopied"
  | "guestNameForLink"
  | "guestAllowedCompanions"
  | "guestAllowedCompanionsHelp"
  | "guestTableNumber"
  | "guestPartyAndTableLine"
  | "guestPartyCountLine"
  | "guestTableLine"
  | "guestListPartyTable"
  | "accountNeedsPermission"
  | "disableFromPlatformHint"
  | "draftStateHint"
  | "venueAddressHelp"
  | "errSlugMin"
  | "errCoupleNamesMin"
  | "errVenueNameMin"
  | "errMapUrl"
  | "rsvpDetailAttendance"
  | "rsvpDetailCompanions"
  | "rsvpClosePanel"
  | "rsvpNoGuestsInCategory"
  | "coverPhotoPreviewHint"
  | "replaceCoverPhoto"
  | "removeCoverPhoto"
  | "coverPhotoUploadLimits"
  | "shareInvitation"
  | "linkCopiedShare"
  | "madeWithVowlink"
  | "galleryEmptyHint"
  | "openInGoogleMaps"
  | "galleryPrev"
  | "galleryNext"
  | "invitationThemeLabel"
  | "invitationThemeHint"
  | "themeRoyal"
  | "themeSage"
  | "themeMidnight"
  | "themeBlush"
  | "themeIvory"
  | "sectionMapTitle"
  | "sectionGalleryTitle"
  | "mapEmbedHelpCouple"
  | "previewInvitationCta"
  | "mapVenueSearchEmbedHint"
  | "storiesTapToEnter"
  | "storiesSwipeHint"
  | "storiesPresentationMode"
  | "storiesModeClassic"
  | "storiesModeStories"
  | "storiesExperienceSection"
  | "storiesBgPhotosLabel"
  | "storiesMusicFromDevice"
  | "storiesMusicUploadHelp"
  | "storiesUploadMusic"
  | "storiesRemoveMusic"
  | "storiesBgModeTitle"
  | "storiesBgModeImages"
  | "storiesBgModeVideo"
  | "storiesBgModeHint"
  | "storiesBgImagesDisabledByVideo"
  | "storiesBgVideoTitle"
  | "storiesBgVideoHelp"
  | "storiesUploadBgVideo"
  | "storiesBgFallbackHint"
  | "storiesMute"
  | "storiesPlayMusic"
  | "storiesBeOurGuest"
  | "storiesSaveTheDate"
  | "storiesOpenMap"
  | "storiesViewGallery"
  | "storiesPoweredBy"
  | "storiesWeddingDateDefault"
  | "storiesCeremonyDefaultTitle"
  | "storiesGiftRegistryDefault"
  | "storiesPolaroidPlaceholder"
  | "storiesPolaroidDefaultCaption"
  | "storiesMusicAutoplayHint"
  | "storiesRsvpPublicHint"
  | "storiesFieldOpeningVerse"
  | "storiesFieldVerseCitation"
  | "storiesFieldTogetherLine"
  | "storiesFieldParentsLeft"
  | "storiesFieldParentsRight"
  | "storiesFieldInvitationParagraph"
  | "storiesFieldHostFamily"
  | "storiesFieldCountdownTagline"
  | "storiesFieldPolaroidCaption"
  | "storiesFieldGalleryMessage"
  | "storiesFieldCeremonyTitle"
  | "storiesFieldRsvpHeading"
  | "storiesFieldRsvpDeadline"
  | "storiesShowGiftSlide"
  | "storiesFieldGiftTitle"
  | "storiesFieldGiftBody"
  | "guestWelcomeTemplateLabel"
  | "guestWelcomeTemplateHelp"
  | "storiesEnglishTextSection"
  | "guestWelcomeTemplateLabelEn"
  | "storiesFieldOpeningVerseEn"
  | "storiesFieldVerseCitationEn"
  | "storiesFieldTogetherLineEn"
  | "storiesFieldParentsLeftEn"
  | "storiesFieldParentsRightEn"
  | "storiesFieldInvitationParagraphEn"
  | "storiesFieldHostFamilyEn"
  | "storiesFieldCountdownTaglineEn"
  | "storiesFieldCeremonyTitleEn"
  | "storiesFieldPolaroidCaptionEn"
  | "storiesFieldGalleryMessageEn"
  | "storiesFieldRsvpHeadingEn"
  | "storiesFieldRsvpDeadlineEn"
  | "storiesFieldGiftTitleEn"
  | "storiesFieldGiftBodyEn"
  | "storiesOpenLocationOnMaps"
  | "storiesSlideGlobalSettings"
  | "storiesSlideSectionOpening"
  | "storiesSlideSectionCountdown"
  | "storiesSlideSectionCeremony"
  | "storiesSlideSectionPolaroid"
  | "storiesSlideSectionRsvp"
  | "storiesSlideSectionGift"
  | "storiesSlideLayoutTitle"
  | "storiesLayoutHorizontal"
  | "storiesLayoutVertical"
  | "storiesLayoutHeadingColor"
  | "storiesLayoutBodyColor"
  | "storiesLayoutHeadingFont"
  | "storiesLayoutBodyFont"
  | "storiesLayoutHeadingSize"
  | "storiesLayoutBodySize"
  | "storiesSizePxHint"
  | "storiesLayoutPreview"
  | "storiesLayoutPreviewArabic"
  | "storiesLayoutPreviewEnglish"
  | "storiesLayoutPreviewHeading"
  | "storiesLayoutPreviewBody"
  | "storiesLayoutPreviewHeadingAr"
  | "storiesLayoutPreviewBodyAr"
  | "storiesLayoutPreviewHeadingEn"
  | "storiesLayoutPreviewBodyEn"
  | "storiesOptCenter"
  | "storiesOptStart"
  | "storiesOptEnd"
  | "storiesSizeSm"
  | "storiesSizeMd"
  | "storiesSizeLg"
  | "storiesSizeXl"
  | "storiesFontDisplay"
  | "storiesFontCairo"
  | "storiesFontAmiri"
  | "storiesFontPlayfair"
  | "storiesFontCinzel"
  | "storiesFontPoppins"
  | "storiesFontGreatvibes"
  | "storiesFontLora"
  | "storiesFontMontserrat"
  | "storiesFontMerriweather"
  | "storiesFontElMessiri"
  | "storiesFontSerif"
  | "storiesFontSans"
  | "storiesLayoutUseDefault"
  | "storiesCeremonyVenueNote"
  | "storiesGiftImage"
  | "storiesUploadGiftImage"
  | "englishContentOptional"
  | "englishContentHelp"
  | "coupleNamesEn"
  | "venueNameEn"
  | "venueAddressEn"
  | "brandLuxecard";

const translations: Record<LanguageCode, Record<TranslationKey, string>> = {
  ar: {
    language: "العربية",
    switchLanguage: "تغيير اللغة",
    royalCollection: "المجموعة الملكية",
    platformDescription:
      "منصة فاخرة لدعوات الزفاف الرقمية المخصصة مع إدارة RSVP ذكية وتجربة ضيوف أنيقة.",
    openAdminDashboard: "فتح لوحة الإدارة",
    openPlatformPortal: "بوابة مالك المنصة",
    openCouplePortal: "بوابة العروسين",
    previewInvitationRoute: "معاينة صفحة الدعوة",
    welcome: "مرحبًا",
    honoredGuest: "الضيف الكريم",
    dearGuest: "ضيفنا العزيز",
    venue: "المكان",
    days: "أيام",
    hours: "ساعات",
    minutes: "دقائق",
    seconds: "ثواني",
    rsvp: "تأكيد الحضور",
    attendance: "حالة الحضور",
    coming: "حاضر",
    notComing: "غير حاضر",
    pending: "قيد الانتظار",
    companions: "المرافقون",
    saveRsvp: "حفظ التأكيد",
    saving: "جارٍ الحفظ...",
    rsvpUpdated: "تم تحديث تأكيد الحضور بنجاح.",
    rsvpFailed: "فشل تحديث تأكيد الحضور.",
    createInvitation: "إنشاء دعوة",
    slug: "الرابط المختصر",
    coupleNames: "أسماء العروسين",
    weddingDate: "تاريخ الزفاف",
    venueName: "اسم المكان",
    venueAddress: "عنوان المكان",
    mapsEmbedUrl: "رابط تضمين خرائط Google",
    coverPhotoUpload: "رفع صورة الغلاف (UploadThing)",
    uploadFailed: "فشل رفع الصورة.",
    guestName: "اسم الضيف",
    addGuest: "إضافة ضيف",
    invitationCreated: "تم إنشاء الدعوة بنجاح.",
    invitationCreateFailed: "فشل إنشاء الدعوة.",
    rsvpDashboard: "لوحة RSVP",
    invitationSlug: "Slug الدعوة",
    loadStats: "تحميل الإحصاءات",
    exportExcel: "تصدير Excel",
    totalGuests: "إجمالي الضيوف",
    failedLoadDashboard: "فشل تحميل إحصاءات اللوحة.",
    emailLabel: "البريد الإلكتروني",
    passwordLabel: "كلمة المرور",
    adminInviteKeyLabel: "مفتاح إنشاء الدعوة (من إعدادات الخادم)",
    adminInviteKeyHint:
      "نفس المفتاح المعرّف في الخادم (ADMIN_INVITATION_CREATE_SECRET). إن لم يُضبط مفتاح في الخادم يمكن الدخول بترك الحقل فارغاً.",
    adminGateTitle: "لوحة إنشاء الدعوة",
    adminGateSubmit: "دخول",
    adminGateInvalid: "كلمة المرور غير صحيحة.",
    adminGateExit: "خروج من اللوحة",
    signIn: "تسجيل الدخول",
    signOut: "تسجيل الخروج",
    platformLoginTitle: "دخول مالك المنصة",
    coupleLoginTitle: "دخول العروسين",
    platformDashboardTitle: "إدارة جميع الدعوات",
    coupleDashboardTitle: "تعديل دعوتكم",
    invitationStatus: "حالة النشر",
    statusDraft: "مسودة",
    statusPublished: "منشورة",
    statusDisabled: "معطّلة",
    coupleSelfRegistration: "السماح للعروسين بالتسجيل الذاتي",
    saveChanges: "حفظ",
    createCoupleAccountSection: "إنشاء حساب عروسين (من المنصة)",
    createCoupleAccountBtn: "إنشاء حساب",
    coupleInviteSlug: "Slug الدعوة المرتبطة",
    accountCreatedSuccess: "تم إنشاء الحساب.",
    genericError: "حدث خطأ.",
    register: "تسجيل",
    coupleEditIntro: "عدّلوا تفاصيل الدعوة الظاهرة للضيوف. لا يمكن تغيير الحالة من هنا.",
    platformIntro: "عرض كل الدعوات، تغيير الحالة، وتفعيل تسجيل العروسين أو إنشاء حساباتهم.",
    invitationsHeading: "قائمة الدعوات",
    noInvitationsYet: "لا توجد دعوات بعد.",
    publicPreviewLink: "رابط المعاينة العامة",
    invitationDashboardLink: "لوحة الدعوة",
    invitationDashboardPageTitle: "لوحة إحصاءات الدعوة",
    openPublicInvitation: "صفحة الضيوف (الدعوة العامة)",
    invitationCreatedWithLinks: "تم الإنشاء. يمكنك فتح لوحة الإحصاءات أو صفحة الضيوف:",
    galleryPhotos: "معرض الصور",
    uploadGalleryPhotos: "رفع صور من الجهاز",
    galleryUploadLimits: "صور حتى 8 ميجابايت لكل ملف، بحد أقصى 12 صورة في المعرض.",
    galleryMaxReached: "وصلتَ للحد الأقصى لعدد صور المعرض (12). احذف صورة لإضافة غيرها.",
    remove: "حذف",
    backToHome: "الرئيسية",
    initialStatus: "الحالة عند الإنشاء",
    allowCoupleSignup: "السماح بتسجيل العروسين",
    invitationSaved: "تم حفظ التعديلات.",
    deleteInvitation: "حذف الدعوة",
    deleteInvitationConfirm:
      "حذف هذه الدعوة نهائياً؟ ستُزال من النظام مع ضيوفها ولا يمكن التراجع.",
    invitationDeleted: "تم حذف الدعوة.",
    allowCreateInvitationCheckbox:
      "السماح للعروسين بإنشاء دعوتهم من لوحتهم (بدون ربط بدعوة جاهزة)",
    inviteSource: "المصدر",
    coupleCreatedBadge: "من العروسين",
    createYourInvitationTitle: "أنشئوا دعوتكم",
    guestLinksTitle: "روابط شخصية للضيوف",
    guestLinksExplain:
      "لكل ضيف تضيفونه يُنشَأ رمز (slug) للرابط. يرسل الضيف الرابط الذي يحتوي على معامل ?guest= ليُعرَف اسمه وتأكيد حضوره مرتبط به.",
    copyGuestLink: "نسخ الرابط",
    guestLinkCopied: "تم النسخ.",
    guestNameForLink: "اسم الضيف للدعوة",
    guestAllowedCompanions: "عدد المرافقين المسموح",
    guestAllowedCompanionsHelp:
      "عدد الأشخاص الإضافيين مع الضيف (مثال: 1 = الضيف + مرافق واحد، أي شخصين).",
    guestTableNumber: "رقم الطاولة",
    guestPartyAndTableLine: "عدد الأشخاص ({count}) الطاولة رقم ({table})",
    guestPartyCountLine: "عدد الأشخاص ({count})",
    guestTableLine: "الطاولة رقم ({table})",
    guestListPartyTable: "الأشخاص: {count} — الطاولة: {table}",
    accountNeedsPermission:
      "هذا الحساب غير مرتبط بدعوة وليس لديه صلاحية إنشاء. تواصلوا مع مالك المنصة.",
    disableFromPlatformHint:
      "يمكن لمالك المنصة تعطيل أو إخفاء الدعوة من لوحة المنصة في أي وقت.",
    draftStateHint:
      "الدعوة بحالة مسودة حتى ينشرها مالك المنصة؛ الضيوف لا يرونها علناً إلا بعد النشر.",
    venueAddressHelp:
      "اكتبوا عنواناً كاملاً (مدينة، شارع، مبنى) — لا يكفي رقم قصير فقط؛ 3 أحرف على الأقل.",
    errSlugMin: "الرابط المختصر (slug): حرفان على الأقل.",
    errCoupleNamesMin: "أسماء العروسين: حرفان على الأقل.",
    errVenueNameMin: "اسم المكان: حرفان على الأقل.",
    errMapUrl: "أدخل رابط تضمين خرائط Google كاملاً (يبدأ بـ https://).",
    rsvpDetailAttendance: "تفاصيل الحضور",
    rsvpDetailCompanions: "المرافقون حسب كل ضيف",
    rsvpClosePanel: "إغلاق",
    rsvpNoGuestsInCategory: "لا يوجد",
    coverPhotoPreviewHint: "معاينة صورة الغلاف كما تظهر للضيوف.",
    replaceCoverPhoto: "استبدال الصورة",
    removeCoverPhoto: "إزالة الصورة",
    coverPhotoUploadLimits: "صور حتى 8 ميجابايت، بحد أقصى 8 ملفات.",
    shareInvitation: "مشاركة الدعوة",
    linkCopiedShare: "تم نسخ الرابط.",
    madeWithVowlink: "صُنعت بـ LUXECARD",
    galleryEmptyHint: "لا توجد صور في المعرض بعد.",
    openInGoogleMaps: "فتح في خرائط Google",
    galleryPrev: "الصورة السابقة",
    galleryNext: "الصورة التالية",
    invitationThemeLabel: "ألوان الدعوة",
    invitationThemeHint:
      "يظهر هذا الاختيار لضيوفك على صفحة الدعوة العامة فقط. يمكنك تغييره في أي وقت.",
    themeRoyal: "كلاسيكي ذهبي",
    themeSage: "زيتوني هادئ",
    themeMidnight: "ليلي أنيق",
    themeBlush: "وردي دافئ",
    themeIvory: "عاجي فاخر",
    sectionMapTitle: "موقع الحفل",
    sectionGalleryTitle: "ألبوم الصور",
    mapEmbedHelpCouple:
      "الصق أي رابط من خرائط Google (مشاركة، مكان، أو تضمين). نُحوّله تلقائياً لعرض خريطة تفاعلية للضيوف. يمكنك تركه فارغاً ليُستخدم البحث حسب اسم المكان والعنوان.",
    previewInvitationCta: "معاينة الدعوة",
    mapVenueSearchEmbedHint:
      "خريطة تفاعلية بالبحث عن اسم المكان والعنوان (لم يُضف رابط خريطة مخصص).",
    storiesTapToEnter: "اضغط للمتابعة",
    storiesSwipeHint: "اسحب لليسار",
    storiesPresentationMode: "نمط عرض الدعوة",
    storiesModeClassic: "صفحة طويلة (كلاسيكي)",
    storiesModeStories: "شرائح ملء الشاشة (سحب)",
    storiesExperienceSection: "محتوى تجربة الشرائح",
    storiesBgPhotosLabel: "صور خلفية الشرائح (تتبدّل تلقائياً)",
    storiesBgFallbackHint:
      "إن لم تُضف صوراً هنا، تُستخدم صورة الغلاف كخلفية للشرائح.",
    storiesMusicFromDevice: "موسيقى الخلفية (من جهازك)",
    storiesMusicUploadHelp:
      "ارفع ملفاً صوتياً (مثل MP3 أو M4A) أو MP4 (موسيقى فقط). يُخزَّن الملف بأمان ويُشغَّل للضيوف بعد الضغط على «ابدأ».",
    storiesUploadMusic: "رفع ملف صوتي أو MP4",
    storiesRemoveMusic: "إزالة الموسيقى",
    storiesBgModeTitle: "خلفية الشرائح",
    storiesBgModeImages: "صور (سلايد شو)",
    storiesBgModeVideo: "فيديو (خلفية واحدة)",
    storiesBgModeHint:
      "يمكنك اختيار صور تتبدّل تلقائيًا أو فيديو يظهر بالخلفية بدل الصور. عند اختيار فيديو يتم تجاهل الصور.",
    storiesBgImagesDisabledByVideo:
      "تم تفعيل فيديو الخلفية، لذا تم تعطيل رفع صور الخلفية.",
    storiesBgVideoTitle: "فيديو الخلفية (اختياري)",
    storiesBgVideoHelp:
      "ارفع فيديو MP4 (أو أي فيديو مدعوم) ليظهر بالخلفية. سيتم تشغيله تلقائيًا بدون صوت.",
    storiesUploadBgVideo: "رفع فيديو للخلفية",
    storiesMute: "كتم",
    storiesPlayMusic: "تشغيل",
    storiesBeOurGuest: "كن ضيفنا",
    storiesSaveTheDate: "احفظ التاريخ",
    storiesOpenMap: "الموقع على الخريطة",
    storiesOpenLocationOnMaps: "افتح الموقع على خرائط Google",
    storiesSlideGlobalSettings: "إعدادات عامة (خلفية وموسيقى)",
    storiesSlideSectionOpening: "الشريحة ١ — الافتتاح والأسماء",
    storiesSlideSectionCountdown: "الشريحة ٢ — العد التنازلي",
    storiesSlideSectionCeremony: "الشريحة ٣ — الموعد والمكان",
    storiesSlideSectionPolaroid: "الشريحة ٤ — الصورة والمعرض",
    storiesSlideSectionRsvp: "الشريحة ٥ — تأكيد الحضور",
    storiesSlideSectionGift: "الشريحة ٦ — الهدايا",
    storiesSlideLayoutTitle: "مظهر النصوص في هذه الشريحة",
    storiesLayoutHorizontal: "محاذاة أفقية",
    storiesLayoutVertical: "موضع عمودي (في الشريحة)",
    storiesLayoutHeadingColor: "لون العناوين (مثل #ffffff)",
    storiesLayoutBodyColor: "لون النصوص (مثل #e2e2e2)",
    storiesLayoutHeadingFont: "خط العناوين",
    storiesLayoutBodyFont: "خط الفقرات",
    storiesLayoutHeadingSize: "حجم العناوين",
    storiesLayoutBodySize: "حجم النصوص",
    storiesSizePxHint: "اكتب الحجم بالبيكسل (px).",
    storiesLayoutPreview: "معاينة فورية",
    storiesLayoutPreviewArabic: "النص العربي",
    storiesLayoutPreviewEnglish: "النص الإنجليزي",
    storiesLayoutPreviewHeading: "عنوان تجريبي",
    storiesLayoutPreviewBody:
      "هذا نص تجريبي لعرض شكل الخط والحجم واللون. يمكنك التعديل ومشاهدة النتيجة مباشرة.",
    storiesLayoutPreviewHeadingAr: "عنوان تجريبي",
    storiesLayoutPreviewBodyAr:
      "هذا نص تجريبي لعرض شكل الخط والحجم واللون. يمكنك التعديل ومشاهدة النتيجة مباشرة.",
    storiesLayoutPreviewHeadingEn: "Sample heading",
    storiesLayoutPreviewBodyEn:
      "Preview text showing font family, size, and color — same styles as Arabic.",
    storiesOptCenter: "وسط",
    storiesOptStart: "البداية",
    storiesOptEnd: "النهاية",
    storiesSizeSm: "صغير",
    storiesSizeMd: "متوسط",
    storiesSizeLg: "كبير",
    storiesSizeXl: "كبير جدا",
    storiesFontDisplay: "عرضي (مميز)",
    storiesFontCairo: "Cairo (عربي أنيق)",
    storiesFontAmiri: "Amiri (كلاسيكي)",
    storiesFontPlayfair: "Playfair (فاخر)",
    storiesFontCinzel: "Cinzel (ملكي)",
    storiesFontPoppins: "Poppins (حديث)",
    storiesFontGreatvibes: "Great Vibes (خط يد)",
    storiesFontLora: "Lora (مقروء)",
    storiesFontMontserrat: "Montserrat (هندسي)",
    storiesFontMerriweather: "Merriweather (مريح)",
    storiesFontElMessiri: "El Messiri (عربي رسمي)",
    storiesFontSerif: "Serif",
    storiesFontSans: "Sans",
    storiesLayoutUseDefault: "افتراضي",
    storiesCeremonyVenueNote:
      "يُعرض اسم المكان والعنوان من حقول الدعوة الرئيسية؛ يفتح زر الخريطة رابط Google Maps في نافذة جديدة.",
    storiesGiftImage: "صورة شريحة الهدايا (اختياري)",
    storiesUploadGiftImage: "رفع صورة للهدايا",
    englishContentOptional: "نسخة باللغة الإنجليزية (اختياري)",
    englishContentHelp:
      "عند تغيير اللغة إلى الإنجليزية، سيُعرض هذا المحتوى بدل العربي (إن تم تعبئته).",
    coupleNamesEn: "أسماء العروسين (EN)",
    venueNameEn: "اسم المكان (EN)",
    venueAddressEn: "عنوان المكان (EN)",
    storiesViewGallery: "المعرض",
    storiesPoweredBy: "صُنعت بـ LUXECARD",
    storiesWeddingDateDefault: "موعد الزفاف",
    storiesCeremonyDefaultTitle: "حفل الزفاف",
    storiesGiftRegistryDefault: "الهدايا",
    storiesPolaroidPlaceholder: "صورة",
    storiesPolaroidDefaultCaption: "♡ وإلى الأبد ♡",
    storiesMusicAutoplayHint: "بعد الضغط تبدأ الموسيقى تلقائياً (يمكنك الكتم من الزر أسفل الشاشة).",
    storiesRsvpPublicHint:
      "لتأكيد الحضور الشخصي، افتحوا الرابط الذي يحتوي على ?guest= المرسل إليكم.",
    storiesFieldOpeningVerse: "نص افتتاحي (آية / ترحيب)",
    storiesFieldVerseCitation: "مرجع النص (مثلاً: سورة …)",
    storiesFieldTogetherLine: "سطر «مع العائلتين»",
    storiesFieldParentsLeft: "أسماء أهل العريس / العمود الأيسر",
    storiesFieldParentsRight: "أسماء أهل العروس / العمود الأيمن",
    storiesFieldInvitationParagraph: "فقرة الدعوة",
    storiesFieldHostFamily: "سطر العائلة المضيفة",
    storiesFieldCountdownTagline: "عنوان شريحة العد التنازلي",
    storiesFieldPolaroidCaption: "نص تحت صورة البولارويد",
    storiesFieldGalleryMessage: "رسالة دعوة لاستعراض المعرض",
    storiesFieldCeremonyTitle: "عنوان شريحة الموعد والمكان",
    storiesFieldRsvpHeading: "عنوان شريحة RSVP",
    storiesFieldRsvpDeadline: "ملاحظة موعد آخر رد",
    storiesShowGiftSlide: "إظهار شريحة الهدايا / التحويل",
    storiesFieldGiftTitle: "عنوان شريحة الهدايا",
    storiesFieldGiftBody: "نص الهدايا (حسابات، تفاصيل)",
    guestWelcomeTemplateLabel: "رسالة ترحيب بالمعزوم",
    guestWelcomeTemplateHelp:
      "اكتب جملة الترحيب فقط؛ يُضاف اسم المعزوم تلقائياً بعدها عند فتح رابطه. للقوالب القديمة ما زال {guestName} يعمل.",
    storiesEnglishTextSection: "نصوص الدعوة بالإنجليزية (اختياري)",
    guestWelcomeTemplateLabelEn: "رسالة ترحيب بالمعزوم (EN)",
    storiesFieldOpeningVerseEn: "نص افتتاحي (EN)",
    storiesFieldVerseCitationEn: "مرجع النص (EN)",
    storiesFieldTogetherLineEn: "سطر «مع العائلتين» (EN)",
    storiesFieldParentsLeftEn: "أسماء أهل العريس / العمود الأيسر (EN)",
    storiesFieldParentsRightEn: "أسماء أهل العروس / العمود الأيمن (EN)",
    storiesFieldInvitationParagraphEn: "فقرة الدعوة (EN)",
    storiesFieldHostFamilyEn: "سطر العائلة المضيفة (EN)",
    storiesFieldCountdownTaglineEn: "عنوان شريحة العد التنازلي (EN)",
    storiesFieldCeremonyTitleEn: "عنوان شريحة الموعد والمكان (EN)",
    storiesFieldPolaroidCaptionEn: "نص تحت صورة البولارويد (EN)",
    storiesFieldGalleryMessageEn: "رسالة المعرض (EN)",
    storiesFieldRsvpHeadingEn: "عنوان شريحة RSVP (EN)",
    storiesFieldRsvpDeadlineEn: "موعد آخر رد (EN)",
    storiesFieldGiftTitleEn: "عنوان شريحة الهدايا (EN)",
    storiesFieldGiftBodyEn: "نص الهدايا (EN)",
    brandLuxecard: "LUXECARD",
  },
  en: {
    language: "English",
    switchLanguage: "Switch Language",
    royalCollection: "Royal Collection",
    platformDescription:
      "A premium platform for personalized digital wedding invitations, smart RSVP management, and elegant guest experiences.",
    openAdminDashboard: "Open Admin Dashboard",
    openPlatformPortal: "Platform owner portal",
    openCouplePortal: "Couple portal",
    previewInvitationRoute: "Preview Invitation Route",
    welcome: "Welcome",
    honoredGuest: "Honored Guest",
    dearGuest: "Dear Guest",
    venue: "Venue",
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
    rsvp: "RSVP",
    attendance: "Attendance",
    coming: "Coming",
    notComing: "Not Coming",
    pending: "Pending",
    companions: "Companions",
    saveRsvp: "Save RSVP",
    saving: "Saving...",
    rsvpUpdated: "RSVP updated successfully.",
    rsvpFailed: "Failed to update RSVP.",
    createInvitation: "Create Invitation",
    slug: "Slug",
    coupleNames: "Couple Names",
    weddingDate: "Wedding Date",
    venueName: "Venue Name",
    venueAddress: "Venue Address",
    mapsEmbedUrl: "Google Maps Embed URL",
    coverPhotoUpload: "Cover Photo Upload (UploadThing)",
    uploadFailed: "Upload failed.",
    guestName: "Guest name",
    addGuest: "Add Guest",
    invitationCreated: "Invitation created successfully.",
    invitationCreateFailed: "Failed to create invitation.",
    rsvpDashboard: "RSVP Dashboard",
    invitationSlug: "Invitation slug",
    loadStats: "Load Stats",
    exportExcel: "Export Excel",
    totalGuests: "Total Guests",
    failedLoadDashboard: "Failed to load dashboard stats.",
    emailLabel: "Email",
    passwordLabel: "Password",
    adminInviteKeyLabel: "Invitation create key (server setting)",
    adminInviteKeyHint:
      "Same key as ADMIN_INVITATION_CREATE_SECRET on the server. If the server has no secret, leave blank.",
    adminGateTitle: "Create invitation",
    adminGateSubmit: "Enter",
    adminGateInvalid: "Invalid password.",
    adminGateExit: "Leave dashboard",
    signIn: "Sign in",
    signOut: "Sign out",
    platformLoginTitle: "Platform owner sign in",
    coupleLoginTitle: "Couple sign in",
    platformDashboardTitle: "All invitations",
    coupleDashboardTitle: "Edit your invitation",
    invitationStatus: "Publication status",
    statusDraft: "Draft",
    statusPublished: "Published",
    statusDisabled: "Disabled",
    coupleSelfRegistration: "Allow couple self-registration",
    saveChanges: "Save",
    createCoupleAccountSection: "Create couple account (from platform)",
    createCoupleAccountBtn: "Create account",
    coupleInviteSlug: "Linked invitation slug",
    accountCreatedSuccess: "Account created.",
    genericError: "Something went wrong.",
    register: "Register",
    coupleEditIntro:
      "Edit the details guests see. Status is managed by the platform owner.",
    platformIntro:
      "View all invitations, change status, enable couple signup, or create couple accounts.",
    invitationsHeading: "Invitations",
    noInvitationsYet: "No invitations yet.",
    publicPreviewLink: "Public preview link",
    invitationDashboardLink: "Invitation dashboard",
    invitationDashboardPageTitle: "Invitation statistics",
    openPublicInvitation: "Guest invitation page",
    invitationCreatedWithLinks: "Created. Open the stats dashboard or the public guest page:",
    galleryPhotos: "Photo gallery",
    uploadGalleryPhotos: "Upload photos from your device",
    galleryUploadLimits: "Up to 8MB per image, max 12 photos in the gallery.",
    galleryMaxReached:
      "Maximum gallery size (12 photos) reached. Remove a photo to add more.",
    remove: "Remove",
    backToHome: "Home",
    initialStatus: "Initial status",
    allowCoupleSignup: "Allow couple signup",
    invitationSaved: "Changes saved.",
    deleteInvitation: "Delete invitation",
    deleteInvitationConfirm:
      "Permanently delete this invitation? It will be removed with all guests. This cannot be undone.",
    invitationDeleted: "Invitation deleted.",
    allowCreateInvitationCheckbox:
      "Allow the couple to create their invitation from their dashboard (no pre-existing invitation)",
    inviteSource: "Source",
    coupleCreatedBadge: "Couple",
    createYourInvitationTitle: "Create your invitation",
    guestLinksTitle: "Personal guest links",
    guestLinksExplain:
      "Each guest you add gets a link slug. Share a URL with ?guest= so RSVP is tied to that guest.",
    copyGuestLink: "Copy link",
    guestLinkCopied: "Copied.",
    guestNameForLink: "Guest name (for the invite)",
    guestAllowedCompanions: "Allowed companions",
    guestAllowedCompanionsHelp:
      "Extra people with the guest (e.g. 1 = guest + one companion, 2 people total).",
    guestTableNumber: "Table number",
    guestPartyAndTableLine: "Party size ({count}) — Table ({table})",
    guestPartyCountLine: "Party size ({count})",
    guestTableLine: "Table ({table})",
    guestListPartyTable: "Party: {count} — Table: {table}",
    accountNeedsPermission:
      "This account is not linked to an invitation and cannot create one. Contact the platform owner.",
    disableFromPlatformHint:
      "The platform owner can disable or hide the invitation from the owner dashboard at any time.",
    draftStateHint:
      "The invitation stays in draft until the platform owner publishes it; guests only see it when published.",
    venueAddressHelp:
      "Enter a full address (city, street, building) — not just a short number; at least 3 characters.",
    errSlugMin: "Slug: at least 2 characters.",
    errCoupleNamesMin: "Couple names: at least 2 characters.",
    errVenueNameMin: "Venue name: at least 2 characters.",
    errMapUrl: "Enter the full Google Maps embed URL (starting with https://).",
    rsvpDetailAttendance: "Attendance breakdown",
    rsvpDetailCompanions: "Companions per guest",
    rsvpClosePanel: "Close",
    rsvpNoGuestsInCategory: "None",
    coverPhotoPreviewHint: "Cover preview as your guests will see it.",
    replaceCoverPhoto: "Replace image",
    removeCoverPhoto: "Remove image",
    coverPhotoUploadLimits: "Images up to 8MB, max 8 files.",
    shareInvitation: "Share invitation",
    linkCopiedShare: "Link copied.",
    madeWithVowlink: "Made with LUXECARD",
    galleryEmptyHint: "No gallery photos yet.",
    openInGoogleMaps: "Open in Google Maps",
    galleryPrev: "Previous image",
    galleryNext: "Next image",
    invitationThemeLabel: "Invitation colors",
    invitationThemeHint:
      "Guests see this on your public invitation page. You can change it anytime.",
    themeRoyal: "Classic gold",
    themeSage: "Soft sage",
    themeMidnight: "Navy night",
    themeBlush: "Warm blush",
    themeIvory: "Ivory luxe",
    sectionMapTitle: "Venue map",
    sectionGalleryTitle: "Photo gallery",
    mapEmbedHelpCouple:
      "Paste any Google Maps link (share, place, or embed). We convert it for a working embedded map. Leave empty to search by venue name and address.",
    previewInvitationCta: "Preview invitation",
    mapVenueSearchEmbedHint:
      "Interactive map from venue name and address (no custom map link saved).",
    storiesTapToEnter: "Tap to continue",
    storiesSwipeHint: "Swipe left",
    storiesPresentationMode: "Invitation layout",
    storiesModeClassic: "Classic (scroll)",
    storiesModeStories: "Full-screen slides (swipe)",
    storiesExperienceSection: "Slide experience content",
    storiesBgPhotosLabel: "Background slideshow images",
    storiesBgFallbackHint:
      "If you add no images here, the cover photo is used as the slideshow background.",
    storiesMusicFromDevice: "Background music (from your device)",
    storiesMusicUploadHelp:
      "Upload an audio file (e.g. MP3 or M4A) or an MP4 (music-only). It is stored securely and plays for guests after they tap to enter.",
    storiesUploadMusic: "Upload audio or MP4",
    storiesRemoveMusic: "Remove music",
    storiesBgModeTitle: "Slide background",
    storiesBgModeImages: "Images (slideshow)",
    storiesBgModeVideo: "Video (single background)",
    storiesBgModeHint:
      "Choose between an auto-changing image slideshow or a background video. When a video is set, images are ignored.",
    storiesBgImagesDisabledByVideo:
      "Background video is enabled, so image uploads are disabled.",
    storiesBgVideoTitle: "Background video (optional)",
    storiesBgVideoHelp:
      "Upload an MP4 (or supported video) to play as the background. It will autoplay muted.",
    storiesUploadBgVideo: "Upload background video",
    storiesMute: "Mute",
    storiesPlayMusic: "Play",
    storiesBeOurGuest: "Be our guest",
    storiesSaveTheDate: "Save the date",
    storiesOpenMap: "Location map",
    storiesOpenLocationOnMaps: "Open location in Google Maps",
    storiesSlideGlobalSettings: "Global settings (background & music)",
    storiesSlideSectionOpening: "Slide 1 — Opening & names",
    storiesSlideSectionCountdown: "Slide 2 — Countdown",
    storiesSlideSectionCeremony: "Slide 3 — Date & venue",
    storiesSlideSectionPolaroid: "Slide 4 — Photo & gallery",
    storiesSlideSectionRsvp: "Slide 5 — RSVP",
    storiesSlideSectionGift: "Slide 6 — Gifts",
    storiesSlideLayoutTitle: "Text appearance on this slide",
    storiesLayoutHorizontal: "Horizontal alignment",
    storiesLayoutVertical: "Vertical position (within slide)",
    storiesLayoutHeadingColor: "Heading color (e.g. #ffffff)",
    storiesLayoutBodyColor: "Body text color (e.g. #e5e5e5)",
    storiesLayoutHeadingFont: "Heading font",
    storiesLayoutBodyFont: "Body font",
    storiesLayoutHeadingSize: "Heading size",
    storiesLayoutBodySize: "Body size",
    storiesSizePxHint: "Enter size in pixels (px).",
    storiesLayoutPreview: "Live preview",
    storiesLayoutPreviewArabic: "Arabic text",
    storiesLayoutPreviewEnglish: "English text",
    storiesLayoutPreviewHeading: "Sample heading",
    storiesLayoutPreviewBody:
      "This is a sample paragraph to preview font, size, and color. Change settings to see results instantly.",
    storiesLayoutPreviewHeadingAr: "عنوان تجريبي",
    storiesLayoutPreviewBodyAr:
      "هذا نص تجريبي لعرض شكل الخط والحجم واللون. يمكنك التعديل ومشاهدة النتيجة مباشرة.",
    storiesLayoutPreviewHeadingEn: "Sample heading",
    storiesLayoutPreviewBodyEn:
      "Preview text showing font family, size, and color — same styles as Arabic.",
    storiesOptCenter: "Center",
    storiesOptStart: "Start",
    storiesOptEnd: "End",
    storiesSizeSm: "Small",
    storiesSizeMd: "Medium",
    storiesSizeLg: "Large",
    storiesSizeXl: "XL",
    storiesFontDisplay: "Display (script)",
    storiesFontCairo: "Cairo (Arabic-friendly)",
    storiesFontAmiri: "Amiri (classic)",
    storiesFontPlayfair: "Playfair (elegant)",
    storiesFontCinzel: "Cinzel (royal)",
    storiesFontPoppins: "Poppins (modern)",
    storiesFontGreatvibes: "Great Vibes (script)",
    storiesFontLora: "Lora (readable serif)",
    storiesFontMontserrat: "Montserrat (geometric)",
    storiesFontMerriweather: "Merriweather (warm serif)",
    storiesFontElMessiri: "El Messiri (Arabic UI)",
    storiesFontSerif: "Serif",
    storiesFontSans: "Sans",
    storiesLayoutUseDefault: "Default",
    storiesCeremonyVenueNote:
      "Venue name and address come from your main invitation fields; the map button opens Google Maps in a new tab.",
    storiesGiftImage: "Gift slide image (optional)",
    storiesUploadGiftImage: "Upload gift image",
    englishContentOptional: "English version (optional)",
    englishContentHelp:
      "When you switch to English, these fields will be shown instead of Arabic (when provided).",
    coupleNamesEn: "Couple names (EN)",
    venueNameEn: "Venue name (EN)",
    venueAddressEn: "Venue address (EN)",
    storiesViewGallery: "Gallery",
    storiesPoweredBy: "Made with LUXECARD",
    storiesWeddingDateDefault: "Wedding date",
    storiesCeremonyDefaultTitle: "Wedding ceremony",
    storiesGiftRegistryDefault: "Gift registry",
    storiesPolaroidPlaceholder: "Photo",
    storiesPolaroidDefaultCaption: "♡ Forever ♡",
    storiesMusicAutoplayHint:
      "After you tap, music starts automatically (use the button at the bottom to mute).",
    storiesRsvpPublicHint:
      "For a personal RSVP, open the link you received that includes ?guest=.",
    storiesFieldOpeningVerse: "Opening verse / welcome text",
    storiesFieldVerseCitation: "Citation (e.g. Surah …)",
    storiesFieldTogetherLine: "“Together with their families” line",
    storiesFieldParentsLeft: "Parents — left column",
    storiesFieldParentsRight: "Parents — right column",
    storiesFieldInvitationParagraph: "Invitation paragraph",
    storiesFieldHostFamily: "Host family line",
    storiesFieldCountdownTagline: "Countdown slide tagline",
    storiesFieldPolaroidCaption: "Polaroid caption (under photo)",
    storiesFieldGalleryMessage: "Gallery invite message",
    storiesFieldCeremonyTitle: "Ceremony slide title",
    storiesFieldRsvpHeading: "RSVP slide heading",
    storiesFieldRsvpDeadline: "RSVP deadline note",
    storiesShowGiftSlide: "Show gift / transfer slide",
    storiesFieldGiftTitle: "Gift slide title",
    storiesFieldGiftBody: "Gift slide body (accounts, details)",
    guestWelcomeTemplateLabel: "Guest welcome message",
    guestWelcomeTemplateHelp:
      "Write the greeting phrase only; the guest’s name is added automatically after it. Legacy templates with {guestName} still work.",
    storiesEnglishTextSection: "English invitation text (optional)",
    guestWelcomeTemplateLabelEn: "Guest welcome message (EN)",
    storiesFieldOpeningVerseEn: "Opening verse / welcome text (EN)",
    storiesFieldVerseCitationEn: "Citation (EN)",
    storiesFieldTogetherLineEn: "“Together with their families” line (EN)",
    storiesFieldParentsLeftEn: "Parents — left column (EN)",
    storiesFieldParentsRightEn: "Parents — right column (EN)",
    storiesFieldInvitationParagraphEn: "Invitation paragraph (EN)",
    storiesFieldHostFamilyEn: "Host family line (EN)",
    storiesFieldCountdownTaglineEn: "Countdown slide tagline (EN)",
    storiesFieldCeremonyTitleEn: "Ceremony slide title (EN)",
    storiesFieldPolaroidCaptionEn: "Polaroid caption (EN)",
    storiesFieldGalleryMessageEn: "Gallery invite message (EN)",
    storiesFieldRsvpHeadingEn: "RSVP slide heading (EN)",
    storiesFieldRsvpDeadlineEn: "RSVP deadline note (EN)",
    storiesFieldGiftTitleEn: "Gift slide title (EN)",
    storiesFieldGiftBodyEn: "Gift slide body (EN)",
    brandLuxecard: "LUXECARD",
  },
};

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  t: (key: TranslationKey) => string;
  isArabic: boolean;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  /** Fixed initial value so SSR + first client render match; real preference loads in useEffect. */
  const [language, setLanguageState] = useState<LanguageCode>("ar");

  useEffect(() => {
    const stored = window.localStorage.getItem("vowlink-language");
    const next: LanguageCode = stored === "en" ? "en" : "ar";
    setLanguageState(next);
    document.documentElement.lang = next;
    document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    window.localStorage.setItem("vowlink-language", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, []);

  const contextValue = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      isArabic: language === "ar",
      t: (key) => translations[language][key],
    }),
    [language, setLanguage],
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useI18n must be used within LanguageProvider.");
  }
  return context;
}
