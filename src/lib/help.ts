/**
 * The phone numbers on the Help Now page.
 *
 * Every number here was checked against the service's own website on
 * 6 November 2026. Check again before changing one, and never add a number
 * from memory: a wrong digit on this page is the worst mistake the app can make.
 */

export interface HelpLine {
  name: string;
  /** As a person would read it. */
  number: string;
  /** Digits only, for the tel: link. */
  tel: string;
  /** Who it is for, in a few words. */
  blurb: string;
}

export const EMERGENCY_LINE: HelpLine = {
  name: "Emergency",
  number: "000",
  tel: "000",
  blurb: "Police, fire or ambulance. Call if a life is in danger.",
};

export const HELP_LINES: HelpLine[] = [
  {
    name: "Open Arms",
    number: "1800 011 046",
    tel: "1800011046",
    blurb: "Counselling for veterans and their families. Day and night.",
  },
  {
    name: "Lifeline",
    number: "13 11 14",
    tel: "131114",
    blurb: "Crisis support for anyone. Day and night.",
  },
  {
    name: "Suicide Call Back Service",
    number: "1300 659 467",
    tel: "1300659467",
    blurb: "Counselling for anyone thinking about suicide, or worried about someone who is.",
  },
  {
    name: "Beyond Blue",
    number: "1300 22 4636",
    tel: "1300224636",
    blurb: "Support for anxiety, depression and hard times.",
  },
  {
    name: "13YARN",
    number: "13 92 76",
    tel: "139276",
    blurb: "Crisis support run by Aboriginal and Torres Strait Islander people.",
  },
  {
    name: "MensLine Australia",
    number: "1300 78 99 78",
    tel: "1300789978",
    blurb: "For men dealing with family, relationship or emotional worries.",
  },
  {
    name: "Safe Zone Support",
    number: "1800 142 072",
    tel: "1800142072",
    blurb: "An anonymous line from Open Arms. You do not have to give your name.",
  },
];
