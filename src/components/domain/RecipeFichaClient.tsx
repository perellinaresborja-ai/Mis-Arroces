"use client";

import { useRecipeState } from "@/components/domain/RecipeStateProvider";
import { Users, ChefHat, Flame, Clock, Hourglass } from "lucide-react";

export function RecipeFichaClient({ recipe, vesselDetails, baseRatio }: { recipe: any, vesselDetails: any, baseRatio: any }) {
  const { servings } = useRecipeState();
  const scaleRatio = servings / (recipe.base_servings || 1);
  
  const currentRice = recipe.rice_qty ? Math.round(recipe.rice_qty * scaleRatio) : null;
  const currentStock = recipe.stock_qty ? Math.round(recipe.stock_qty * scaleRatio) : null;

  return (
    <>
      {/* Elegant Stats Row */}
      <div className="flex flex-wrap items-center gap-x-8 lg:gap-x-12 gap-y-5 mt-6 md:mt-0 py-5 border-y border-border">
        {recipe.base_servings && (
          <div className="flex items-center gap-3 text-foreground">
            <Users className="w-5 h-5 text-muted-foreground/80" />
            <span className="font-semibold text-[15px]">{servings} pax</span>
          </div>
        )}
        {recipe.style?.name && (
          <div className="flex items-center gap-3 text-foreground">
            <ChefHat className="w-5 h-5 text-muted-foreground/80" />
            <span className="font-semibold text-[15px]">{recipe.style.name}</span>
          </div>
        )}
        {recipe.heat?.name && (
          <div className="flex items-center gap-3 text-foreground">
            <Flame className="w-5 h-5 text-muted-foreground/80" />
            <span className="font-semibold text-[15px]">{recipe.heat.name.split('/')[0]}</span>
          </div>
        )}
        {recipe.cook_time && (
          <div className="flex items-center gap-3 text-foreground">
            <Clock className="w-5 h-5 text-muted-foreground/80" />
            <span className="font-semibold text-[15px]">{recipe.cook_time} min</span>
          </div>
        )}
        {recipe.rest_time && (
          <div className="flex items-center gap-3 text-foreground">
            <Hourglass className="w-5 h-5 text-muted-foreground/80" />
            <span className="font-semibold text-[15px]">{recipe.rest_time}m reposo</span>
          </div>
        )}
      </div>

      {/* Technical Data Card */}
      <div className="mt-8 md:mt-0 bg-muted/20 rounded-2xl p-5 border border-border/50 w-full">
        <h3 className="font-bold text-base mb-4 text-charcoal font-serif uppercase tracking-wider">Ficha Técnica</h3>
        <div className="flex flex-row flex-wrap sm:flex-nowrap justify-between gap-4 sm:gap-2 md:gap-4 text-sm">
          {recipe.variety && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-1">Variedad de arroz</span>
              <span className="font-semibold text-foreground">{recipe.variety.name}</span>
            </div>
          )}
          {currentRice && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-1">Cantidad de arroz</span>
              <span className="font-semibold text-foreground">{currentRice}g</span>
            </div>
          )}
          {currentStock && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-1">Cantidad de caldo</span>
              <span className="font-semibold text-foreground">{currentStock}ml</span>
            </div>
          )}
          {vesselDetails?.diameter_cm && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-1">Medida de paella</span>
              <span className="font-semibold text-foreground">{vesselDetails.diameter_cm} cm</span>
            </div>
          )}
          {baseRatio && (
            <div className="flex flex-col">
              <span className="text-muted-foreground text-[10px] md:text-xs uppercase tracking-wider mb-0.5">Proporción</span>
              <span className="text-[9px] font-bold text-muted-foreground/60 tracking-widest leading-none mb-1">ARROZ:CALDO</span>
              <span className="font-semibold text-foreground">1:{baseRatio}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
