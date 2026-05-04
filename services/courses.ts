import type { Course, Product, RawUser } from "@/types";
import { api } from "./api";


const COURSE_LEVELS: Array<"Beginner" | "Intermediate" | "Advanced"> = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const DURATIONS = [
  "4h 30m",
  "6h 15m",
  "8h 45m",
  "12h 00m",
  "3h 20m",
  "10h 10m",
  "5h 55m",
  "7h 30m",
  "9h 00m",
  "2h 45m",
];

export function transformToCourse(
  product: Product,
  instructor: RawUser
): Course {
  const instructorId = instructor.login?.uuid ?? `${product.id}-instructor`;
  const level = COURSE_LEVELS[product.id % COURSE_LEVELS.length];
  const duration = DURATIONS[product.id % DURATIONS.length];
  const studentsEnrolled = Math.floor(product.stock * 40 + product.rating * 150);
  const lessonsCount = Math.floor(product.stock / 3) + 5;

  return {
    id: String(product.id),
    title: product.title,
    description: product.description,
    price: product.price,
    originalPrice: parseFloat(
      (product.price / (1 - product.discountPercentage / 100)).toFixed(2)
    ),
    rating: product.rating,
    category: product.category,
    thumbnail: product.thumbnail,
    images: product.images,
    instructor: {
      id: instructorId,
      name: instructor.name,
      email: instructor.email,
      picture: instructor.picture,
      location: instructor.location,
      nat: instructor.nat,
    },
    duration,
    level,
    studentsEnrolled,
    isEnrolled: false,
    isBookmarked: false,
    lessonsCount,
    brand: product.brand,
  };
}


export const CourseService = {
  async fetchCourses(page = 1, limit = 10): Promise<Course[]> {
    const [productsRes, usersRes] = await Promise.all([
      api.get<{
        data: { data: Product[] };
        success: boolean;
      }>(`/api/v1/public/randomproducts?page=${page}&limit=${limit}`),
      api.get<{
        data: { data: RawUser[] };
        success: boolean;
      }>(`/api/v1/public/randomusers?page=${page}&limit=${limit}`),
    ]);

    const products = productsRes.data.data.data ?? [];
    const users = usersRes.data.data.data ?? [];

    return products.map((product, index) => {
      const instructor = users[index % users.length];
      return transformToCourse(product, instructor);
    });
  },

  async fetchCourseById(id: string): Promise<Course | null> {
    try {
      const [productRes, userRes] = await Promise.all([
        api.get<{
          data: Product;
          success: boolean;
        }>(`/api/v1/public/randomproducts/${id}`),
        api.get<{
          data: { data: RawUser[] };
          success: boolean;
        }>(`/api/v1/public/randomusers?page=1&limit=1`),
      ]);

      const product = productRes.data.data;
      const user = userRes.data.data.data?.[0];
      if (!product || !user) return null;

      return transformToCourse(product, user);
    } catch {
      return null;
    }
  },

  filterCourses(courses: Course[], query: string): Course[] {
    if (!query.trim()) return courses;
    const q = query.toLowerCase();
    return courses.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        `${c.instructor.name.first} ${c.instructor.name.last}`
          .toLowerCase()
          .includes(q)
    );
  },
};
