// get the ninja-keys element
const ninja = document.querySelector('ninja-keys');

// add the home and posts menu items
ninja.data = [{
    id: "nav-about",
    title: "about",
    section: "Navigation",
    handler: () => {
      window.location.href = "/";
    },
  },{id: "nav-blog",
          title: "blog",
          description: "",
          section: "Navigation",
          handler: () => {
            window.location.href = "/blog/";
          },
        },{id: "nav-projects",
          title: "projects",
          description: "A growing collection of your cool projects.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/projects/";
          },
        },{id: "nav-repositories",
          title: "repositories",
          description: "Edit the `_data/repositories.yml` and change the `github_users` and `github_repos` lists to include your own GitHub profile and repositories.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/repositories/";
          },
        },{id: "nav-cv",
          title: "cv",
          description: "This is a description of the page. You can modify it in &#39;_pages/cv.md&#39;. You can also change or remove the top pdf download button.",
          section: "Navigation",
          handler: () => {
            window.location.href = "/cv/";
          },
        },{id: "dropdown-bookshelf",
              title: "bookshelf",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/books/";
              },
            },{id: "dropdown-blog",
              title: "blog",
              description: "",
              section: "Dropdown",
              handler: () => {
                window.location.href = "/blog/";
              },
            },{id: "post-from-broken-builds-to-live-portfolio-a-jekyll-amp-al-folio-journey",
        
          title: "From Broken Builds to Live Portfolio: A Jekyll &amp; al-folio Journey",
        
        description: "Documenting the final hurdles of deploying my portfolio, from cryptic errors and giscus configurations to fixing a CI/CD pipeline.",
        section: "Posts",
        handler: () => {
          
            window.location.href = "/blog/2025/first-post/";
          
        },
      },{id: "books-house-of-leaves",
          title: 'House of Leaves',
          description: "",
          section: "Books",handler: () => {
              window.location.href = "/books/house_of_leaves/";
            },},{id: "news-welcome-to-my-new-website-please-feel-free-to-leave-a-comment-on-any-blog-post-or-project-you-see-just-make-sure-to-sign-in-via-github-first",
          title: '🎍🎍🎍 Welcome to my new website! Please feel free to leave a comment...',
          description: "",
          section: "News",},{id: "projects-fusion-manaba-frontend",
          title: 'fusion-manaba-frontend',
          description: "The official frontend for Fusion Manaba, a modern e-commerce platform.",
          section: "Projects",handler: () => {
              window.location.href = "/projects/0_project/";
            },},{
        id: 'social-email',
        title: 'email',
        section: 'Socials',
        handler: () => {
          window.open("mailto:%6A%72%6D%39%30@%6D%65.%63%6F%6D", "_blank");
        },
      },{
        id: 'social-flickr',
        title: 'Flickr',
        section: 'Socials',
        handler: () => {
          window.open("https://www.flickr.com/203373029@N03", "_blank");
        },
      },{
        id: 'social-github',
        title: 'GitHub',
        section: 'Socials',
        handler: () => {
          window.open("https://github.com/richtxteditor", "_blank");
        },
      },{
        id: 'social-linkedin',
        title: 'LinkedIn',
        section: 'Socials',
        handler: () => {
          window.open("https://www.linkedin.com/in/jrmolin90", "_blank");
        },
      },{
        id: 'social-rss',
        title: 'RSS Feed',
        section: 'Socials',
        handler: () => {
          window.open("/feed.xml", "_blank");
        },
      },{
      id: 'light-theme',
      title: 'Change theme to light',
      description: 'Change the theme of the site to Light',
      section: 'Theme',
      handler: () => {
        setThemeSetting("light");
      },
    },
    {
      id: 'dark-theme',
      title: 'Change theme to dark',
      description: 'Change the theme of the site to Dark',
      section: 'Theme',
      handler: () => {
        setThemeSetting("dark");
      },
    },
    {
      id: 'system-theme',
      title: 'Use system default theme',
      description: 'Change the theme of the site to System Default',
      section: 'Theme',
      handler: () => {
        setThemeSetting("system");
      },
    },];
