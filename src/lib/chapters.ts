export type Lesson = {
  slug: string;
  title: string;
  notebook: string;
  blurb?: string;
};

export type Chapter = {
  slug: string;
  number: string;
  title: string;
  summary: string;
  lessons: Lesson[];
};

export const chapters: Chapter[] = [
  {
    slug: 'introduction',
    number: '0',
    title: 'Introduction',
    summary: 'A short overview of Simultaneous Localization and Mapping — what it is, why we need it, and the shape of the problem.',
    lessons: [
      {
        slug: 'intro',
        title: 'Introduction to SLAM',
        notebook: 'notebooks/0_introduction/0_intro.ipynb',
        blurb: 'What SLAM is, why it matters, and the high-level taxonomy of approaches.',
      },
    ],
  },
  {
    slug: 'kalman-filters',
    number: '1',
    title: 'Kalman Filters',
    summary: 'Recursive Bayesian state estimation, motion and sensor models, the Kalman & Extended Kalman filters, and EKF-SLAM.',
    lessons: [
      {
        slug: 'bayes',
        title: 'Recursive Bayes Filter',
        notebook: 'notebooks/1_kalman_filters/1_bayes.ipynb',
        blurb: 'The probabilistic foundation: belief, prediction, and correction.',
      },
      {
        slug: 'models',
        title: 'Motion & Sensor Models',
        notebook: 'notebooks/1_kalman_filters/2_models.ipynb',
        blurb: 'Odometry, velocity, range-bearing and other models used inside filters.',
      },
      {
        slug: 'kalman',
        title: 'Kalman & Extended Kalman Filters',
        notebook: 'notebooks/1_kalman_filters/3_kalman_filters.ipynb',
        blurb: 'Linear KF, linearization via Jacobians, the EKF prediction/update cycle.',
      },
      {
        slug: 'ekf-slam',
        title: 'EKF-SLAM',
        notebook: 'notebooks/1_kalman_filters/4_ekf_slam.ipynb',
        blurb: 'Estimating the robot pose and landmark map jointly with an EKF.',
      },
    ],
  },
  {
    slug: 'particle-filters',
    number: '2',
    title: 'Particle Filters',
    summary: 'Occupancy grid mapping, Monte Carlo localization, FastSLAM and Rao-Blackwellized particle filters.',
    lessons: [
      {
        slug: 'grid-maps',
        title: 'Occupancy Grid Maps',
        notebook: 'notebooks/2_particle_filters/1_grid_maps.ipynb',
        blurb: 'Representing the world as a grid of free / occupied cells via log-odds.',
      },
      {
        slug: 'particle-filter',
        title: 'Monte Carlo Localization',
        notebook: 'notebooks/2_particle_filters/2_particle_filter.ipynb',
        blurb: 'Approximating beliefs with weighted samples; sampling, weighting, resampling.',
      },
      {
        slug: 'fast-slam',
        title: 'FastSLAM',
        notebook: 'notebooks/2_particle_filters/3_fast_slam.ipynb',
        blurb: 'Factoring SLAM into a particle filter over poses plus per-particle landmark EKFs.',
      },
      {
        slug: 'grid-based-slam',
        title: 'Grid-based SLAM (RBPF)',
        notebook: 'notebooks/2_particle_filters/4_grid_based_slam.ipynb',
        blurb: 'Rao-Blackwellized particle filter for SLAM with occupancy grids.',
      },
    ],
  },
  {
    slug: 'graph-slam',
    number: '3',
    title: 'Least Squares & Graph-based SLAM',
    summary: 'Nonlinear least-squares estimation, the least-squares formulation of SLAM, and landmark graph-based SLAM.',
    lessons: [
      {
        slug: 'least-squares',
        title: 'Nonlinear Least Squares',
        notebook: 'notebooks/3_graph_based/1_least_squares.ipynb',
        blurb: 'Gauss–Newton, Levenberg–Marquardt, and the normal equations.',
      },
      {
        slug: 'least-squares-slam',
        title: 'Least-Squares SLAM',
        notebook: 'notebooks/3_graph_based/2_least_squares_slam.ipynb',
        blurb: 'Pose-graph constraints and global optimization of trajectories.',
      },
      {
        slug: 'landmark-graph-slam',
        title: 'Landmark Graph-based SLAM',
        notebook: 'notebooks/3_graph_based/3_landmark_graph_slam.ipynb',
        blurb: 'Joint pose + landmark graphs and information-matrix sparsity.',
      },
    ],
  },
];

export function getChapter(slug: string): Chapter | undefined {
  return chapters.find((c) => c.slug === slug);
}

export function getLesson(chapterSlug: string, lessonSlug: string): Lesson | undefined {
  return getChapter(chapterSlug)?.lessons.find((l) => l.slug === lessonSlug);
}

export type FlatLesson = Lesson & { chapter: Chapter; href: string };

export const flatLessons: FlatLesson[] = chapters.flatMap((chapter) =>
  chapter.lessons.map((lesson) => ({
    ...lesson,
    chapter,
    href: `/chapters/${chapter.slug}/${lesson.slug}`,
  }))
);

export function neighbors(chapterSlug: string, lessonSlug: string) {
  const idx = flatLessons.findIndex(
    (l) => l.chapter.slug === chapterSlug && l.slug === lessonSlug
  );
  return {
    prev: idx > 0 ? flatLessons[idx - 1] : undefined,
    next: idx >= 0 && idx < flatLessons.length - 1 ? flatLessons[idx + 1] : undefined,
  };
}
