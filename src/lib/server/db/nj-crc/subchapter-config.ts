export type NJSubchapterConfig = {
	subchapterNumber: string;
	title: string;
	slug: string;
	sourceFile: string;
	sortOrder: number;
	priority: boolean;
};

export const NJ_SUBCHAPTERS: NJSubchapterConfig[] = [
	{
		subchapterNumber: '1',
		title: 'General Provisions',
		slug: 'njac-17-30-1',
		sourceFile: '/tmp/nj-crc/subchapter-1.txt',
		sortOrder: 0,
		priority: false
	},
	{
		subchapterNumber: '2',
		title: 'Consumer and License Holder Protections; Consumer Prohibitions',
		slug: 'njac-17-30-2',
		sourceFile: '/tmp/nj-crc/subchapter-2.txt',
		sortOrder: 1,
		priority: false
	},
	{
		subchapterNumber: '3',
		title: 'Organization and Operation of the Commission',
		slug: 'njac-17-30-3',
		sourceFile: '/tmp/nj-crc/subchapter-3.txt',
		sortOrder: 2,
		priority: false
	},
	{
		subchapterNumber: '4',
		title: 'Independent Study; Commission Reporting',
		slug: 'njac-17-30-4',
		sourceFile: '/tmp/nj-crc/subchapter-4.txt',
		sortOrder: 3,
		priority: false
	},
	{
		subchapterNumber: '5',
		title: 'Municipal Authority',
		slug: 'njac-17-30-5',
		sourceFile: '/tmp/nj-crc/subchapter-5.txt',
		sortOrder: 4,
		priority: false
	},
	{
		subchapterNumber: '6',
		title: 'Cannabis Business Licensing General Terms',
		slug: 'njac-17-30-6',
		sourceFile: '/tmp/nj-crc/subchapter-6.txt',
		sortOrder: 5,
		priority: false
	},
	{
		subchapterNumber: '7',
		title: 'Cannabis Business Conditional and Annual Licensing Process',
		slug: 'njac-17-30-7',
		sourceFile: '/tmp/nj-crc/subchapter-7.txt',
		sortOrder: 6,
		priority: false
	},
	{
		subchapterNumber: '8',
		title: 'Cannabis Business Identification Cards',
		slug: 'njac-17-30-8',
		sourceFile: '/tmp/nj-crc/subchapter-8.txt',
		sortOrder: 7,
		priority: false
	},
	{
		subchapterNumber: '9',
		title: 'Cannabis Business License Holder Material Conditions and Requirements',
		slug: 'njac-17-30-9',
		sourceFile: '/tmp/nj-crc/subchapter-9.txt',
		sortOrder: 8,
		priority: false
	},
	{
		subchapterNumber: '10',
		title: 'Cannabis Cultivator Authorized Conduct',
		slug: 'njac-17-30-10',
		sourceFile: '/tmp/nj-crc/subchapter-10.txt',
		sortOrder: 9,
		priority: true
	},
	{
		subchapterNumber: '11',
		title: 'Cannabis Manufacturer Authorized Conduct',
		slug: 'njac-17-30-11',
		sourceFile: '/tmp/nj-crc/subchapter-11.txt',
		sortOrder: 10,
		priority: true
	},
	{
		subchapterNumber: '12',
		title: 'Cannabis Wholesaler Authorized Conduct',
		slug: 'njac-17-30-12',
		sourceFile: '/tmp/nj-crc/subchapter-12.txt',
		sortOrder: 11,
		priority: false
	},
	{
		subchapterNumber: '13',
		title: 'Cannabis Distributor Authorized Conduct',
		slug: 'njac-17-30-13',
		sourceFile: '/tmp/nj-crc/subchapter-13.txt',
		sortOrder: 12,
		priority: false
	},
	{
		subchapterNumber: '14',
		title: 'Cannabis Retailer Authorized Conduct',
		slug: 'njac-17-30-14',
		sourceFile: '/tmp/nj-crc/subchapter-14.txt',
		sortOrder: 13,
		priority: false
	},
	{
		subchapterNumber: '15',
		title: 'Cannabis Delivery Service Authorized Conduct',
		slug: 'njac-17-30-15',
		sourceFile: '/tmp/nj-crc/subchapter-15.txt',
		sortOrder: 14,
		priority: false
	},
	{
		subchapterNumber: '16',
		title: 'Release for Distribution; Packaging and Labeling of Cannabis Items',
		slug: 'njac-17-30-16',
		sourceFile: '/tmp/nj-crc/subchapter-16.txt',
		sortOrder: 15,
		priority: false
	},
	{
		subchapterNumber: '17',
		title: 'Advertising',
		slug: 'njac-17-30-17',
		sourceFile: '/tmp/nj-crc/subchapter-17.txt',
		sortOrder: 16,
		priority: false
	},
	{
		subchapterNumber: '18',
		title: 'Licensing of Testing Laboratories',
		slug: 'njac-17-30-18',
		sourceFile: '/tmp/nj-crc/subchapter-18.txt',
		sortOrder: 17,
		priority: false
	},
	{
		subchapterNumber: '19',
		title: 'Personal Use Usable Cannabis and Cannabis Product Testing Procedures',
		slug: 'njac-17-30-19',
		sourceFile: '/tmp/nj-crc/subchapter-19.txt',
		sortOrder: 18,
		priority: false
	},
	{
		subchapterNumber: '20',
		title: 'Monitoring, Enforcement Actions, and Appeal Rights',
		slug: 'njac-17-30-20',
		sourceFile: '/tmp/nj-crc/subchapter-20.txt',
		sortOrder: 19,
		priority: false
	}
];

export type NJStatuteConfig = {
	title: string;
	slug: string;
	sourceFile: string;
};

export const NJ_STATUTE: NJStatuteConfig = {
	title: 'Cannabis Regulatory, Enforcement Assistance, and Marketplace Modernization Act',
	slug: 'njsa-24-6i-creamma',
	sourceFile: '/tmp/nj-crc/creamma.txt'
};

export type NJGuidanceConfig = {
	documentId: string;
	title: string;
	slug: string;
	sourceFile: string;
	sortOrder: number;
};

export const NJ_GUIDANCE_DOCS: NJGuidanceConfig[] = [
	{
		documentId: 'edibles',
		title: 'Edibles Guidance Document',
		slug: 'nj-guidance-edibles',
		sourceFile: '/tmp/nj-crc/guidance-edibles.txt',
		sortOrder: 0
	},
	{
		documentId: 'packaging-labeling',
		title: 'Packaging and Labeling Guide',
		slug: 'nj-guidance-packaging-labeling',
		sourceFile: '/tmp/nj-crc/guidance-packaging-labeling.txt',
		sortOrder: 1
	},
	{
		documentId: 'packaging-labeling-addendum',
		title: 'Packaging and Labeling Guide Addendum',
		slug: 'nj-guidance-packaging-labeling-addendum',
		sourceFile: '/tmp/nj-crc/guidance-packaging-labeling-addendum.txt',
		sortOrder: 2
	}
];
