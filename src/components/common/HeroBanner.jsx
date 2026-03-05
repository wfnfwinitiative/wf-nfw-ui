import heroBanner from '../../assets/NFW_Hero_Banner.png';
import logo from '../../assets/NoFoodWaste_Logo_Orange.png';
export function HeroBanner() {
  return (
    <div className="relative rounded-2xl overflow-hidden h-48 md:h-64 w-full bg-orange-500">
  <div
    className="absolute inset-0 bg-contain bg-center bg-no-repeat"
    style={{ backgroundImage: `url(${heroBanner})` }}
  />

  {/* Gradient overlay */}
  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
</div>
  );
}
