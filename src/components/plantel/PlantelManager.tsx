import { useState, useCallback } from 'react';
import { PlantelList } from './PlantelList';
import { DogProfile } from './DogProfile';
import { AnimalCreateForm } from './AnimalCreateForm';
import { AnimalDeleteModal } from './AnimalDeleteModal';

type View = 'list' | 'detail' | 'create';

export function PlantelManager() {
  const [view, setView] = useState<View>('list');
  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const goToList = useCallback(() => {
    setSelectedDogId(null);
    setView('list');
    setListRefreshKey(k => k + 1);
  }, []);

  const handleDeleted = useCallback(() => {
    setDeleteTarget(null);
    goToList();
  }, [goToList]);

  if (view === 'create') {
    return (
      <AnimalCreateForm
        onSuccess={(id) => {
          setSelectedDogId(id);
          setView('detail');
        }}
        onCancel={() => setView('list')}
      />
    );
  }

  if (view === 'detail' && selectedDogId) {
    return (
      <>
        <DogProfile
          dogId={selectedDogId}
          onBack={() => {
            setSelectedDogId(null);
            setView('list');
            setListRefreshKey(k => k + 1);
          }}
          onDeleteRequest={(name) => setDeleteTarget({ id: selectedDogId, name })}
        />
        {deleteTarget && (
          <AnimalDeleteModal
            isOpen
            onClose={() => setDeleteTarget(null)}
            animalId={deleteTarget.id}
            animalName={deleteTarget.name}
            onDeleted={handleDeleted}
          />
        )}
      </>
    );
  }

  return (
    <>
      <PlantelList
        refreshKey={listRefreshKey}
        onSelectDog={(id) => {
          setSelectedDogId(id);
          setView('detail');
        }}
        onNewAnimal={() => setView('create')}
        onDeleteDog={(id, name) => setDeleteTarget({ id, name })}
      />
      {deleteTarget && (
        <AnimalDeleteModal
          isOpen
          onClose={() => setDeleteTarget(null)}
          animalId={deleteTarget.id}
          animalName={deleteTarget.name}
          onDeleted={handleDeleted}
        />
      )}
    </>
  );
}
