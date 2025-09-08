document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const toggleBtn = document.getElementById("darkModeToggle");
  const icon = toggleBtn.querySelector("i");

  // Check saved preference
  const savedMode = localStorage.getItem("darkMode");
  if (savedMode === "false") {
    body.classList.remove("dark-mode");
    body.classList.add("light-mode");
    icon.classList.remove("fa-sun");
    icon.classList.add("fa-moon");
  } else {
    body.classList.add("dark-mode");
    body.classList.remove("light-mode");
    icon.classList.remove("fa-moon");
    icon.classList.add("fa-sun");
    localStorage.setItem("darkMode", "true");
  }

  // Toggle dark mode
  toggleBtn.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    body.classList.toggle("light-mode");

    if (body.classList.contains("dark-mode")) {
      icon.classList.remove("fa-moon");
      icon.classList.add("fa-sun");
      localStorage.setItem("darkMode", "true");
    } else {
      icon.classList.remove("fa-sun");
      icon.classList.add("fa-moon");
      localStorage.setItem("darkMode", "false");
    }
  });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });

  // Fetch GitHub Repos
  fetchGitHubRepos();
});

async function fetchGitHubRepos() {
  const username = "HazemmoAlsady";
  const timeline = document.getElementById("projects-timeline");
  timeline.innerHTML = '<div class="loading">Loading projects...</div>';

  try {
    // ⚠️ FIXED: Removed extra space after /users/
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
    const repos = await response.json();

    if (!response.ok) throw new Error("Failed to fetch repos");

    const filteredRepos = repos
      .filter(repo => !repo.fork)
      .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));

    timeline.innerHTML = "";

    filteredRepos.forEach((repo, index) => {
      const item = document.createElement("div");
      item.className = "timeline-item";

      item.style.left = index % 2 === 0 ? "0" : "50%";

      const tags = getTagsFromRepo(repo);
      const description = repo.description || "No description provided. Check the repo for details.";

      item.innerHTML = `
        <div class="card">
          <h3>${repo.name}</h3>
          <p>${description}</p>
          <div class="project-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
          </div>
          <div class="project-actions">
            <a href="${repo.html_url}" target="_blank" class="btn-code">
              <i class="fab fa-github"></i> View Code
            </a>
            ${repo.homepage ? `<a href="${repo.homepage}" target="_blank" class="btn-code">Live Demo</a>` : ""}
          </div>
        </div>
      `;

      timeline.appendChild(item);
    });

    // Trigger animations
    setTimeout(() => {
      const items = document.querySelectorAll('.timeline-item');
      items.forEach((item, index) => {
        setTimeout(() => {
          item.classList.add('active');
        }, index * 300);
      });
    }, 100);

  } catch (error) {
    timeline.innerHTML = `<div class="loading">Failed to load projects. Please try again later.</div>`;
    console.error("Error fetching GitHub repos:", error);
  }
}

function getTagsFromRepo(repo) {
  const tags = [];
  if (repo.language && !['Jupyter Notebook', 'HTML', 'CSS'].includes(repo.language)) {
    tags.push(repo.language);
  }

  const name = repo.name.toLowerCase();
  const keywordMap = {
    "dbt": "dbt", "airflow": "Airflow", "snowflake": "Snowflake", "aws": "AWS",
    "pyspark": "PySpark", "spark": "Spark", "pandas": "pandas", "numpy": "NumPy",
    "python": "Python", "sql": "SQL", "excel": "Excel", "powerbi": "Power BI",
    "docker": "Docker", "postgresql": "PostgreSQL", "git": "Git", "github": "GitHub",
    "etl": "ETL", "pipeline": "Data Pipeline", "warehouse": "Data Warehouse"
  };

  for (const [keyword, tag] of Object.entries(keywordMap)) {
    if (name.includes(keyword)) tags.push(tag);
  }

  return [...new Set(tags)];
}