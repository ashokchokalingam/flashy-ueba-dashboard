import { Alert } from "./types";
import EntityHeader from "./EntityHeader";
import EntitySearchInput from "./EntitySearchInput";
import EntityList from "./EntityList";
import { useEntitySearch } from "./hooks/useEntitySearch";
import { useEntityData } from "./hooks/useEntityData";
import { getUniqueEntities } from "./utils/entityUtils";

interface RiskyEntitiesProps {
  alerts: Alert[];
  type: "users-origin" | "users-impacted" | "computers";
  onEntitySelect: (entityId: string) => void;
}

const RiskyEntities = ({ alerts, type, onEntitySelect }: RiskyEntitiesProps) => {
  const {
    originUsers,
    impactedUsers,
    impactedComputers,
    isLoadingOrigin,
    isLoadingImpacted,
    isLoadingComputers
  } = useEntityData(type);

  const entities = getUniqueEntities(
    type,
    impactedUsers,
    originUsers,
    impactedComputers
  ).sort((a, b) => b.uniqueTitles - a.uniqueTitles);

  const { searchQuery, setSearchQuery, filteredEntities } = useEntitySearch(entities);

  const isLoading = type === "users-origin" ? isLoadingOrigin : 
                   type === "users-impacted" ? isLoadingImpacted : 
                   isLoadingComputers;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <EntityHeader totalEntities={0} isLoading={true} type={type} />
        <div className="text-center text-blue-400/60 py-6 text-sm">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EntityHeader 
        totalEntities={entities.length} 
        isLoading={isLoading}
        type={type}
      />
      
      <EntitySearchInput
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      
      <EntityList
        entities={filteredEntities}
        onEntitySelect={onEntitySelect}
      />
    </div>
  );
};

export default RiskyEntities;