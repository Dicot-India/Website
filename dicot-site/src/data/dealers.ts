export type Dealer = {
  company: string;
  territory: string;
  city: string;
  address: string[];
  phone: { label: string; href: string };
  email: string;
  website?: string;
};

// Details mirror the channel-partner listing on dicot.in/contact.html.
// Confirm with each partner before changing a phone number or address.
export const dealers: Dealer[] = [
  {
    company: "Micon Automation Systems Private Limited",
    territory: "Gujarat",
    city: "Ahmedabad",
    address: [
      "A-814, Siddhi Vinayak Towers",
      "Off S. G. Road, B/H DCP Office",
      "Makarba, Ahmedabad, Gujarat 380051",
    ],
    phone: { label: "+91 97234 62290", href: "+919723462290" },
    email: "sales@miconindia.com",
    website: "https://www.miconindia.com",
  },
  {
    company: "Rasci Instruments India Private Limited",
    territory: "Tamil Nadu",
    city: "Chennai",
    address: [
      "Plot No. 2 & 3, Balaji Nagar, 4th Street",
      "Mettukuppam, Thoraipakkam",
      "Chennai, Tamil Nadu 600097",
    ],
    phone: { label: "+91 98412 91758", href: "+919841291758" },
    email: "solution@rasciindia.com",
  },
  {
    company: "MBI Solutions",
    territory: "Mumbai",
    city: "Mumbai",
    address: [
      "Pl-1004, Promenade 1",
      "LBS Marg, Ghatkopar West",
      "Mumbai, Maharashtra 400086",
    ],
    phone: { label: "+91 98210 63652", href: "+919821063652" },
    email: "mbisolutions@gmail.com",
  },
];
