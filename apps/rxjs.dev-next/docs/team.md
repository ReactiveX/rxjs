---
layout: page
---

<script setup>
import {
  VPTeamPage,
  VPTeamPageTitle,
  VPTeamMembers,
  VPTeamPageSection
} from 'vitepress/theme'

function transformMember(member) {
  const links = []
  if (member.github) {
    links.push({ icon: 'github', link: member.github })
  }
  if (member.twitter) {
    links.push({ icon: 'x', link: member.twitter })
  }
  if (member.website) {
    links.push({ icon: { svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></g></svg>`, }, link: member.website })
  }

  return {
    avatar: member.picture,
    name: member.name,
    title: member.role,
    links: links.length > 0 ? links : undefined
  }
}

const contributorsData = [
  {
    "name": "Ben Lesh",
    "role": "Lead Developer",
    "github": "https://github.com/benlesh",
    "picture": "https://avatars2.githubusercontent.com/u/1540597",
    "twitter": "https://twitter.com/BenLesh",
    "website": "https://benlesh.com",
    "group": "Core Team"
  },
  {
    "name": "Paul Taylor",
    "role": "Developer",
    "github": "https://github.com/trxcllnt",
    "picture": "https://avatars2.githubusercontent.com/u/178183",
    "twitter": "https://twitter.com/inlineptx",
    "website": "http://graphistry.com",
    "group": "Core Team"
  },
  {
    "name": "OJ Kwon",
    "role": "Developer",
    "github": "https://github.com/kwonoj",
    "picture": "https://avatars1.githubusercontent.com/u/1210596",
    "twitter": "https://twitter.com/_ojkwon",
    "group": "Core Team"
  },
  {
    "name": "David Driscoll",
    "role": "Developer",
    "github": "https://github.com/david-driscoll",
    "picture": "https://avatars0.githubusercontent.com/u/1269157",
    "twitter": "https://twitter.com/david_dotnet",
    "website": "https://www.daviddriscoll.me/",
    "group": "Core Team"
  },
  {
    "name": "Tracy Lee",
    "role": "Developer",
    "github": "https://github.com/ladyleet",
    "picture": "https://avatars0.githubusercontent.com/u/8270563",
    "twitter": "https://twitter.com/ladyleet",
    "website": "http://thisdot.co",
    "group": "Core Team"
  },
  {
    "name": "Nicholas Jamieson",
    "group": "Core Team",
    "github": "https://github.com/cartant",
    "picture": "https://avatars0.githubusercontent.com/u/3878593",
    "twitter": "https://twitter.com/ncjamieson",
    "website": "http://cartant.com",
    "role": "Developer"
  },
  {
    "name": "Tracy Lee",
    "role": "Developer",
    "github": "https://github.com/ladyleet",
    "picture": "https://avatars0.githubusercontent.com/u/8270563",
    "twitter": "https://twitter.com/ladyleet",
    "website": "http://thisdot.co",
    "group": "Learning Team"
  },
  {
    "name": "Ashwin Sureshkumar",
    "role": "Developer",
    "github": "https://github.com/ashwin-sureshkumar",
    "picture": "https://avatars0.githubusercontent.com/u/4744080",
    "twitter": "https://twitter.com/Sureshkumar_Ash",
    "website": "https://medium.com/@Sureshkumar_Ash",
    "group": "Learning Team"
  },
  {
    "name": "Brian Troncone",
    "role": "Developer",
    "github": "https://github.com/btroncone",
    "picture": "https://avatars3.githubusercontent.com/u/5085101",
    "twitter": "http://twitter.com/btroncone",
    "group": "Learning Team"
  },
  {
    "name": "Sumit Arora",
    "role": "Developer",
    "github": "https://github.com/sumitarora",
    "picture": "https://avatars3.githubusercontent.com/u/198247",
    "twitter": "https://twitter.com/arorasumit",
    "website": "https://sumitarora.dev/",
    "group": "Learning Team"
  },
  {
    "name": "Jen Luker",
    "role": "Developer, A11y",
    "github": "https://github.com/knitcodemonkey",
    "picture": "https://avatars0.githubusercontent.com/u/1584489",
    "twitter": "https://twitter.com/knitcodemonkey",
    "website": "http://jenluker.com",
    "group": "Learning Team"
  },
  {
    "name": "Jan-Niklas Wortmann",
    "role": "Developer",
    "github": "https://github.com/JWO719",
    "picture": "https://avatars3.githubusercontent.com/u/6104311",
    "twitter": "https://twitter.com/niklas_wortmann",
    "group": "Learning Team"
  },
  {
    "name": "Matthew Podwysocki",
    "role": "Developer",
    "github": "https://github.com/mattpodwysocki",
    "picture": "https://avatars0.githubusercontent.com/u/49051",
    "twitter": "https://twitter.com/mattpodwysocki",
    "group": "Alumn"
  },
  {
    "name": "André Staltz",
    "role": "Developer",
    "github": "https://github.com/staltz",
    "picture": "https://avatars0.githubusercontent.com/u/90512",
    "twitter": "https://twitter.com/andrestaltz",
    "website": "http://staltz.com",
    "group": "Alumn"
  },
  {
    "name": "Jay Phelps",
    "role": "Developer",
    "github": "https://github.com/jayphelps",
    "picture": "https://avatars0.githubusercontent.com/u/762949",
    "website": "http://jayphelps.com",
    "group": "Alumn"
  },
  {
    "name": "Natalie Smith",
    "role": "Developer",
    "github": "https://github.com/natmegs",
    "picture": "https://avatars0.githubusercontent.com/u/19582796",
    "group": "Contributors"
  },
  {
    "name": "Cédric Soulas",
    "role": "Developer",
    "github": "https://github.com/cedricss",
    "picture": "https://avatars0.githubusercontent.com/u/802010",
    "twitter": "https://twitter.com/CedricSoulas",
    "website": "http://reactive.how/",
    "group": "Contributors"
  },
  {
    "name": "Jason Aden",
    "role": "Developer",
    "github": "https://github.com/jasonaden",
    "picture": "https://avatars1.githubusercontent.com/u/516168",
    "twitter": "https://twitter.com/jasonaden1",
    "group": "Contributors"
  },
  {
    "name": "Jan-Niklas Wortmann",
    "role": "Developer",
    "github": "https://github.com/niklas-wortmann",
    "picture": "https://avatars3.githubusercontent.com/u/6104311",
    "twitter": "https://twitter.com/niklas_wortmann",
    "group": "Core Team"
  },
  {
    "name": "Mladen Jakovljević",
    "role": "Developer",
    "github": "https://github.com/jakovljevic-mladen",
    "picture": "https://avatars3.githubusercontent.com/u/28087049",
    "twitter": "https://twitter.com/jakovljevicMla",
    "group": "Core Team"
  }
]

const coreMembers = contributorsData
  .filter(m => m.group === 'Core Team')
  .map(transformMember)

const learningTeam = contributorsData
  .filter(m => m.group === 'Learning Team')
  .map(transformMember)

const alumn = contributorsData
  .filter(m => m.group === 'Alumn')
  .map(transformMember)

const contributors = contributorsData
  .filter(m => m.group === 'Contributors')
  .map(transformMember)

const otherTeams = [
  { name: 'Learning Team', members: learningTeam },
  { name: 'Alumn', members: alumn },
  { name: 'Contributors', members: contributors },
].filter(team => team.members.length > 0)
</script>

<VPTeamPage style="margin-top: 0;">
  <VPTeamPageTitle>
    <template #title>Our Team</template>
    <template #lead>
      The development of RxJS is guided by an international
      team, some of whom have chosen to be featured below.
    </template>
  </VPTeamPageTitle>
  <VPTeamMembers size="medium" :members="coreMembers" />
  <VPTeamPageSection v-for="team in otherTeams" :key="team.name">
    <template #title>{{ team.name }}</template>
    <template #members>
      <VPTeamMembers size="small" :members="team.members" />
    </template>
  </VPTeamPageSection>
</VPTeamPage>
