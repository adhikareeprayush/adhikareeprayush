require('dotenv').config();
const Mustache = require('mustache');
const fetch = require('node-fetch');
const fs = require('fs');

const MUSTACHE_MAIN_DIR = './main.mustache';

let DATA = {
  refresh_date: new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short',
    timeZone: 'Asia/Kathmandu',
  }),
};

async function setGitHubRepositories() {
  try {
    const headers = {};
    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    const response = await fetch(
      'https://api.github.com/users/adhikareeprayush/repos?sort=updated&type=all&per_page=30',
      {
        headers,
      }
    );

    const repos = await response.json();

    if (response.ok && Array.isArray(repos)) {
      // Filter out forked repos and get top 3 most starred/updated
      const ownRepos = repos
        .filter(repo => !repo.fork)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 3);

      DATA.github_repositories = ownRepos.map(repo => ({
        name: repo.name,
        description: repo.description || 'No description available',
        url: repo.html_url,
        full_name: repo.full_name,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language || 'Unknown',
      }));

      console.log(`✅ Fetched ${DATA.github_repositories.length} repositories`);
    } else {
      throw new Error(`GitHub API Error: ${repos.message || 'Unknown error'}`);
    }
  } catch (error) {
    console.log('❌ Error fetching repositories:', error.message);
    // Fallback data
    DATA.github_repositories = [
      {
        name: 'MERN-Stack-Portfolio',
        description: 'Full-stack portfolio built with MERN stack',
        url: 'https://github.com/adhikareeprayush',
        full_name: 'adhikareeprayush/MERN-Stack-Portfolio',
        stars: 0,
        forks: 0,
        language: 'JavaScript',
      },
      {
        name: 'Java-DSA-Practice',
        description: 'Data Structures and Algorithms practice in Java',
        url: 'https://github.com/adhikareeprayush',
        full_name: 'adhikareeprayush/Java-DSA-Practice',
        stars: 0,
        forks: 0,
        language: 'Java',
      },
      {
        name: 'React-UI-Components',
        description: 'Reusable React components library',
        url: 'https://github.com/adhikareeprayush',
        full_name: 'adhikareeprayush/React-UI-Components',
        stars: 0,
        forks: 0,
        language: 'TypeScript',
      },
    ];
  }
}

async function setDevToPosts() {
  try {
    const response = await fetch('https://dev.to/api/articles?username=adhikareeprayush&per_page=6');
    const posts = await response.json();

    DATA.devto_posts = posts.map(post => ({
      title: post.title,
      description: post.description || 'Click to read more...',
      url: post.url,
      published_at: new Date(post.published_at).toLocaleDateString('en-GB'),
      positive_reactions_count: post.positive_reactions_count,
      reading_time_minutes: post.reading_time_minutes,
    }));
  } catch (error) {
    console.log('Error fetching dev.to posts:', error);
    // Fallback data
    DATA.devto_posts = [
      {
        title: 'Building Scalable MERN Stack Applications',
        description: 'Best practices for structuring and scaling MERN applications',
        url: 'https://dev.to/adhikareeprayush',
        published_at: '2025-08-01',
        positive_reactions_count: 0,
        reading_time_minutes: 5,
      },
      {
        title: 'Java vs JavaScript: A Computer Engineering Perspective',
        description: "Comparing two powerful languages from a CS student's viewpoint",
        url: 'https://dev.to/adhikareeprayush',
        published_at: '2025-07-28',
        positive_reactions_count: 0,
        reading_time_minutes: 7,
      },
      {
        title: 'Mastering Data Structures with C++',
        description: 'Essential DSA concepts every developer should know',
        url: 'https://dev.to/adhikareeprayush',
        published_at: '2025-07-25',
        positive_reactions_count: 0,
        reading_time_minutes: 8,
      },
      {
        title: 'From Design to Code: UI/UX with Figma',
        description: 'Creating beautiful interfaces that developers love to implement',
        url: 'https://dev.to/adhikareeprayush',
        published_at: '2025-07-20',
        positive_reactions_count: 0,
        reading_time_minutes: 6,
      },
      {
        title: 'Getting Started with DevOps as a Student',
        description: 'Docker, CI/CD, and cloud basics for beginners',
        url: 'https://dev.to/adhikareeprayush',
        published_at: '2025-07-15',
        positive_reactions_count: 0,
        reading_time_minutes: 10,
      },
      {
        title: 'LeetCode Journey: Problem Solving Tips',
        description: 'Strategies for tackling algorithmic challenges effectively',
        url: 'https://dev.to/adhikareeprayush',
        published_at: '2025-07-10',
        positive_reactions_count: 0,
        reading_time_minutes: 12,
      },
    ];
  }
}

async function setLeetCodeStats() {
  try {
    // Try to fetch real LeetCode stats using community API
    const username = process.env.LEETCODE_USERNAME || 'adhikareeprayush';

    try {
      // First try the alfa-leetcode-api
      const response = await fetch(`https://alfa-leetcode-api.onrender.com/${username}/solved`);
      const data = await response.json();

      if (response.ok && data.solvedProblem) {
        DATA.leetcode_stats = [
          {
            total_solved: data.solvedProblem.toString(),
            easy_solved: data.easySolved ? data.easySolved.toString() : 'N/A',
            medium_solved: data.mediumSolved ? data.mediumSolved.toString() : 'N/A',
            hard_solved: data.hardSolved ? data.hardSolved.toString() : 'N/A',
          },
        ];
        console.log('✅ LeetCode stats fetched from API');
        return;
      }
    } catch (apiError) {
      console.log('API fetch failed, using your provided stats...');
    }

    // Fallback to your actual stats (300+ solved)
    DATA.leetcode_stats = [
      {
        total_solved: '300+',
        easy_solved: '180',
        medium_solved: '100',
        hard_solved: '20',
      },
    ];
    console.log('✅ LeetCode stats set (your actual numbers: 300+)');
  } catch (error) {
    console.log('❌ Error fetching LeetCode stats:', error);
    // Fallback to your stats
    DATA.leetcode_stats = [
      {
        total_solved: '300+',
        easy_solved: '180',
        medium_solved: '100',
        hard_solved: '20',
      },
    ];
  }
}

async function generateReadMe() {
  await fs.readFile(MUSTACHE_MAIN_DIR, (err, data) => {
    if (err) throw err;
    const output = Mustache.render(data.toString(), DATA);
    fs.writeFileSync('README.md', output);
  });
}

async function action() {
  /**
   * Fetch GitHub Repositories
   */
  await setGitHubRepositories();

  /**
   * Fetch Dev.to Posts
   */
  await setDevToPosts();

  /**
   * Fetch LeetCode Stats
   */
  await setLeetCodeStats();

  /**
   * Generate README
   */
  await generateReadMe();

  console.log('README.md updated successfully!');
}

action();
