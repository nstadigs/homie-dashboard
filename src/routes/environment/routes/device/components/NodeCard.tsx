import { Node } from "#/lib/Store.ts";
import { Card, GridItem, Separator } from "@chakra-ui/react";
import { EmptyState } from "#/components/ui/empty-state.tsx";
import { Property } from "#/routes/environment/components/Property.tsx";
import { Field } from "#/components/ui/field.tsx";
import { Fragment } from "react";

export type NodeCardProps = {
  nodeId: string;
  node: Node;
  onSet: (propertyId: string, value: string) => void;
};

export function NodeCard({ node, nodeId, onSet }: NodeCardProps) {
  return (
    <Card.Root variant="subtle" asChild size="sm">
      <GridItem key={nodeId} borderWidth="1px" borderRadius="md">
        <Card.Body gap="3">
          <Card.Title>{node.name ?? nodeId}</Card.Title>
          {node.properties.size === 0 ? (
            <EmptyState title="No properties">No properties</EmptyState>
          ) : (
            node.properties.entries().map(([propertyId, property]) => (
              <Fragment key={propertyId}>
                <Separator />
                <Field key={propertyId} label={property.name ?? propertyId}>
                  <Property
                    key={propertyId}
                    property={property}
                    onSet={(value: string) => {
                      onSet(propertyId, value);
                    }}
                  />
                </Field>
              </Fragment>
            ))
          )}
        </Card.Body>
      </GridItem>
    </Card.Root>
  );
}
