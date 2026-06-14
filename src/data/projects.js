// Shared placeholder project records consumed by both ProjectListView and
// ProjectDetailView. Pure data — no behaviour, no reactivity, no I/O.
//
// Promote to src/services/projects.js per docs/FRONTEND.md §10 only when load-
// from-network or transformation logic appears. Until then this lives under
// src/data/.
//
// Schema (per docs/feature-plans/_index.md "Shared placeholder project records"):
//   { slug, title, subtitle?, thumbnail?, thumbnailAlt?, description }
//
// `slug` is treated as an opaque lookup key. ProjectDetailView resolves
// `route.params.slug` against this list and never interpolates the URL value
// into :href / :src / v-html, so unknown / malicious slugs fall through to the
// not-found branch safely.

export const projects = [
    {
        slug: "project-one",
        title: "Project One",
        subtitle: "A placeholder subtitle for the first project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the first project. Real content lands in a later round.",
    },
    {
        slug: "project-two",
        title: "Project Two",
        subtitle: "A placeholder subtitle for the second project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the second project. Real content lands in a later round.",
    },
    {
        slug: "project-three",
        title: "Project Three",
        subtitle: "A placeholder subtitle for the third project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the third project. Real content lands in a later round.",
    },
    {
        slug: "project-four",
        title: "Project Four",
        subtitle: "A placeholder subtitle for the fourth project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the fourth project. Real content lands in a later round.",
    },
    {
        slug: "project-five",
        title: "Project Five",
        subtitle: "A placeholder subtitle for the fifth project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the fifth project. Real content lands in a later round.",
    },
    {
        slug: "project-six",
        title: "Project Six",
        subtitle: "A placeholder subtitle for the sixth project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the sixth project. Real content lands in a later round.",
    },
    {
        slug: "project-seven",
        title: "Project Seven",
        subtitle: "A placeholder subtitle for the seventh project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the seventh project. Real content lands in a later round.",
    },
    {
        slug: "project-eight",
        title: "Project Eight",
        subtitle: "A placeholder subtitle for the eighth project.",
        thumbnail: "",
        thumbnailAlt: "",
        description:
            "A short placeholder description for the eighth project. Real content lands in a later round.",
    },
];
