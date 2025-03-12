import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/gallery.tsx"),
    route("image/:id", "routes/imageDetails.tsx")
] satisfies RouteConfig;
