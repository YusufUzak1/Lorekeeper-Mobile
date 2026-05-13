import React, { useMemo, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, PanResponder } from 'react-native';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowLeft, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useUniverseStore } from '../store/useUniverseStore';
import { useNavigation } from '@react-navigation/native';

const TYPE_COLORS: Record<string, string> = {
  character: '#8B5CF6',
  place: '#10B981',
  event: '#F59E0B'
};

function CosmosNode({ entity, position, isActive, isFaded, onSelect }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  const color = TYPE_COLORS[entity.type] || '#C6A052';
  const scale = isActive ? 1.5 : 1;
  const opacity = isFaded ? 0.2 : 0.9;

  useFrame((state, delta) => {
    if (meshRef.current && isActive) {
      meshRef.current.rotation.y += delta * 2;
    }
  });

  return (
    <mesh 
      ref={meshRef} 
      position={position} 
      scale={[scale, scale, scale]}
      onClick={(e) => { e.stopPropagation(); onSelect(entity); }}
    >
      <sphereGeometry args={[2, 16, 16]} />
      <meshStandardMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

function CosmosEdge({ startPos, endPos, isFaded, isActive }: any) {
  const points = useMemo(() => {
    if (!startPos || !endPos) return null;
    return [
      new THREE.Vector3(...startPos),
      new THREE.Vector3(...endPos)
    ];
  }, [startPos, endPos]);

  if (!points) return null;

  const lineGeometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);
  const opacity = isActive ? 0.8 : isFaded ? 0.1 : 0.3;
  const color = isActive ? '#C6A052' : '#ffffff';

  return (
    // @ts-ignore
    <line geometry={lineGeometry}>
      {/* @ts-ignore */}
      <lineBasicMaterial attach="material" color={color} transparent opacity={opacity} linewidth={isActive ? 2 : 1} />
    </line>
  );
}

function CosmosScene({ entities, connections, nodePositions, selectedEntity, setSelectedEntity, isFaded, isEdgeFaded }: any) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[100, 100, 100]} intensity={1} />
      <pointLight position={[-100, -100, -100]} intensity={0.5} />
      
      {connections.map((conn: any) => {
        const sPos = nodePositions[conn.sourceId];
        const ePos = nodePositions[conn.targetId];
        if (!sPos || !ePos) return null;
        return (
          <CosmosEdge 
            key={conn.id} 
            startPos={sPos} endPos={ePos} 
            isActive={selectedEntity?.id === conn.sourceId || selectedEntity?.id === conn.targetId}
            isFaded={isEdgeFaded(conn)} 
          />
        );
      })}

      {entities.map((entity: any) => (
        <CosmosNode 
          key={entity.id} 
          entity={entity} 
          position={nodePositions[entity.id]} 
          isActive={selectedEntity?.id === entity.id}
          isFaded={isFaded(entity.id)}
          onSelect={setSelectedEntity}
        />
      ))}
    </group>
  );
}

export function CosmosScreen() {
  const navigation = useNavigation<any>();
  const { getEntitiesForCurrentUniverse, getConnectionsForCurrentUniverse } = useUniverseStore();
  const entities = getEntitiesForCurrentUniverse();
  const connections = getConnectionsForCurrentUniverse();

  const [selectedEntity, setSelectedEntity] = useState<any>(null);

  // Sabit pozisyonlar hesaplaması
  const nodePositions = useMemo(() => {
    const positions: Record<string, [number, number, number]> = {};
    const total = entities.length;
    
    entities.forEach((entity, i) => {
      const ang = (i / total) * Math.PI * 2;
      const rad = 25 + Math.sin(i * 1.3) * 15;
      const x = Math.cos(ang) * rad + (Math.sin(i * 3.1) - 0.5) * 20;
      const y = Math.sin(ang * 1.6) * 20 + (Math.cos(i * 2.5) - 0.5) * 15;
      const z = Math.cos(ang * 0.7) * 20 + (Math.sin(i * 1.8) - 0.5) * 15;
      positions[entity.id] = [x, y, z];
    });
    return positions;
  }, [entities]);

  const isFaded = (id: string) => {
    if (!selectedEntity) return false;
    if (selectedEntity.id === id) return false;
    const hasConn = connections.some(c => 
      (c.sourceId === selectedEntity.id && c.targetId === id) ||
      (c.targetId === selectedEntity.id && c.sourceId === id)
    );
    return !hasConn;
  };

  const isEdgeFaded = (conn: any) => {
    if (!selectedEntity) return false;
    return conn.sourceId !== selectedEntity.id && conn.targetId !== selectedEntity.id;
  };

  const selectedConnCount = selectedEntity
    ? connections.filter(c => c.sourceId === selectedEntity.id || c.targetId === selectedEntity.id).length
    : 0;

  return (
    <View className="flex-1 bg-mythos-bg">
      <View className="absolute top-14 left-6 z-10 flex-row justify-between right-6">
        <TouchableOpacity onPress={() => navigation.goBack()} className="bg-black/50 p-2 rounded-full border border-white/10">
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text className="text-mythos-text font-bold text-xl pt-1">Kosmos Haritası</Text>
        <View className="w-10" />
      </View>

      {/* Legend */}
      <View className="absolute top-28 left-6 z-10 bg-black/60 rounded-xl border border-white/10 p-3">
        <Text className="text-white/40 text-[9px] uppercase tracking-wider mb-2 font-bold">Tip Renkleri</Text>
        {[
          { type: 'character', label: 'Karakter', color: '#8B5CF6' },
          { type: 'place', label: 'Mekan', color: '#10B981' },
          { type: 'event', label: 'Olay', color: '#F59E0B' },
        ].map(t => (
          <View key={t.type} className="flex-row items-center mb-1">
            <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: t.color }} />
            <Text className="text-white/60 text-[10px]">{t.label}</Text>
          </View>
        ))}
        <View className="border-t border-white/10 mt-2 pt-2">
          <Text className="text-white/30 text-[9px]">{entities.length} varlık · {connections.length} bağlantı</Text>
        </View>
      </View>

      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 80], fov: 55 }}>
        <CosmosScene 
          entities={entities}
          connections={connections}
          nodePositions={nodePositions}
          selectedEntity={selectedEntity}
          setSelectedEntity={setSelectedEntity}
          isFaded={isFaded}
          isEdgeFaded={isEdgeFaded}
        />
      </Canvas>

      {/* Seçili Entity Overlay */}
      {selectedEntity && (
        <View className="absolute bottom-10 left-6 right-6 bg-mythos-panel p-5 rounded-2xl border border-mythos-accent/40 z-10">
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text className="text-white font-bold text-xl">{selectedEntity.name}</Text>
              <Text className="text-mythos-accent text-sm">
                {selectedEntity.type === 'character' ? 'Karakter' : selectedEntity.type === 'place' ? 'Mekan' : 'Olay'}
                {selectedEntity.era ? ` · ${selectedEntity.era}` : ''}
                {` · ${selectedConnCount} bağlantı`}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedEntity(null)} className="p-1 bg-white/10 rounded-full">
              <Text className="text-white/60 text-xs px-1">✕</Text>
            </TouchableOpacity>
          </View>
          {selectedEntity.description ? (
            <Text className="text-white/50 text-xs mb-3 leading-4" numberOfLines={2}>{selectedEntity.description}</Text>
          ) : null}
          <TouchableOpacity 
            className="bg-mythos-accent/20 p-3 rounded-xl items-center border border-mythos-accent/30"
            onPress={() => navigation.navigate('EntitiesTab', { screen: 'EntityDetail', params: { entityId: selectedEntity.id }})}
          >
            <Text className="text-mythos-accent font-bold">Detaylara Git</Text>
          </TouchableOpacity>
        </View>
      )}
      {!selectedEntity && (
        <View className="absolute bottom-10 left-0 right-0 items-center pointer-events-none">
          <View className="bg-black/50 px-4 py-2 rounded-full">
            <Text className="text-mythos-muted text-xs">Bağlantıları görmek için bir varlığa dokun.</Text>
          </View>
        </View>
      )}
    </View>
  );
}
